/* みたもキッチンの公開用インフラ。
 *
 *   S3（非公開）  ←  CloudFront（配信・HTTPS・セキュリティヘッダー）  ←  閲覧者
 *
 * 設計で意識したこと
 * - **S3 バケットは一切公開しない。** CloudFront からだけ読めるようにする（OAC）。
 *   「バケットを公開設定にして事故る」が静的サイトで最も多い失敗なので、構造で防ぐ。
 * - **GitHub にアクセスキーを保存しない。** OIDC で、その場限りの資格情報を受け取る。
 * - 証明書（ACM）は CloudFront の仕様で **us-east-1 にしか置けない**。
 *   そのためスタック全体を us-east-1 に置いている。
 *   オリジンの位置は体感に影響しない（CloudFront が各地にキャッシュするため）。
 */

import type { StackProps } from 'aws-cdk-lib';
import {
  Stack, RemovalPolicy, Duration, CfnOutput,
  aws_s3 as s3,
  aws_cloudfront as cf,
  aws_cloudfront_origins as origins,
  aws_certificatemanager as acm,
  aws_route53 as route53,
  aws_route53_targets as targets,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export type SiteStackProps = StackProps & {
  /** 独自ドメイン。まだ無ければ undefined のままでよい（CloudFront のURLで公開される） */
  domainName?: string;
  /** GitHub の owner/repo。デプロイを許可する相手を絞るために使う */
  githubRepo: string;
};

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const { domainName, githubRepo } = props;

    /* ---------- 置き場所 ---------- */
    const bucket = new s3.Bucket(this, 'SiteBucket', {
      /* 公開しない。CloudFront だけが読む */
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      /* 上書き事故から戻せるようにしておく。静的サイトなので容量は知れている */
      versioned: true,
      lifecycleRules: [{ noncurrentVersionExpiration: Duration.days(30) }],
      removalPolicy: RemovalPolicy.RETAIN,
    });

    /* ---------- URL の整え ----------
       /en/ のようにディレクトリで来たら index.html を返す。
       S3 は「ディレクトリ」を知らないので、ここで補ってやる必要がある。
       開発用の serve.ps1 も同じ処理を入れて、手元と本番の挙動を合わせてある。 */
    const rewrite = new cf.Function(this, 'RewriteIndex', {
      code: cf.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }
  return request;
}`),
      runtime: cf.FunctionRuntime.JS_2_0,
      comment: 'ディレクトリ指定を index.html に読み替える',
    });

    /* ---------- セキュリティヘッダー ----------
       サイトにインラインの <script> が1つも無いので、script-src を 'self' だけに絞れる。
       ここまで絞れるのは、素のHTMLで組んできた副産物。

       style は属性で書いている箇所があるため 'unsafe-inline' が要る。
       frame-src は、お仕事のご依頼フォーム（Google）と動画（Instagram）の2つだけ。 */
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src https://fonts.gstatic.com",
      "script-src 'self'",
      "frame-src https://docs.google.com https://www.instagram.com",
      "form-action 'self' https://docs.google.com",
      "base-uri 'none'",
      "object-src 'none'",
      "frame-ancestors 'none'",
    ].join('; ');

    const headers = new cf.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        contentSecurityPolicy: { contentSecurityPolicy: csp, override: true },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(365),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cf.HeadersFrameOption.DENY, override: true },
        referrerPolicy: {
          referrerPolicy: cf.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
      },
    });

    /* ---------- 証明書とドメイン ----------
       ドメインが決まるまでは undefined のまま。CloudFront のURLで動く。 */
    let certificate: acm.ICertificate | undefined;
    let zone: route53.IHostedZone | undefined;

    if (domainName) {
      zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName });
      certificate = new acm.Certificate(this, 'Cert', {
        domainName,
        subjectAlternativeNames: [`www.${domainName}`],
        validation: acm.CertificateValidation.fromDns(zone),
      });
    }

    /* ---------- 配信 ---------- */
    const distribution = new cf.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      httpVersion: cf.HttpVersion.HTTP2_AND_3,
      /* 日本の閲覧者が中心。北米・欧州・アジアに絞って費用を抑える */
      priceClass: cf.PriceClass.PRICE_CLASS_200,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cf.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: headers,
        compress: true,
        functionAssociations: [
          { function: rewrite, eventType: cf.FunctionEventType.VIEWER_REQUEST },
        ],
      },
      domainNames: domainName ? [domainName, `www.${domainName}`] : undefined,
      certificate,
      /* 存在しないURLでも、404として正しく返す */
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 404, responsePagePath: '/index.html', ttl: Duration.minutes(5) },
        { httpStatus: 404, responseHttpStatus: 404, responsePagePath: '/index.html', ttl: Duration.minutes(5) },
      ],
    });

    if (domainName && zone) {
      for (const [id2, name] of [['Apex', domainName], ['Www', `www.${domainName}`]] as const) {
        new route53.ARecord(this, `ARecord${id2}`, {
          zone,
          recordName: name,
          target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        });
      }
    }

    /* ---------- GitHub からのデプロイ ----------
       アクセスキーを発行して GitHub に貼る、という方法は取らない。
       OIDC で「このリポジトリの、このブランチから来た」ことを AWS 側が確認し、
       その場限りの資格情報を渡す。鍵がどこにも保存されないので、漏れようがない。 */
    const provider = new iam.OpenIdConnectProvider(this, 'GitHubOidc', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    const deployRole = new iam.Role(this, 'GitHubDeployRole', {
      roleName: 'mitamo-kitchen-deploy',
      /* CloudFormation の制約で、この説明文には日本語が使えない */
      description: 'Deploy role for GitHub Actions: sync to S3 and invalidate CloudFront',
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
        /* main ブランチからのみ。他のブランチやフォークからは引き受けられない */
        StringLike: { 'token.actions.githubusercontent.com:sub': `repo:${githubRepo}:ref:refs/heads/main` },
      }),
      maxSessionDuration: Duration.hours(1),
    });

    bucket.grantReadWrite(deployRole);
    deployRole.addToPolicy(new iam.PolicyStatement({
      actions: ['cloudfront:CreateInvalidation'],
      resources: [`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`],
    }));

    /* ---------- 使う値 ---------- */
    new CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new CfnOutput(this, 'SiteUrl', {
      value: domainName ? `https://${domainName}` : `https://${distribution.distributionDomainName}`,
    });
    new CfnOutput(this, 'DeployRoleArn', { value: deployRole.roleArn });
  }
}
