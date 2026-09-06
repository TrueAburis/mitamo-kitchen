#!/usr/bin/env node
/* 構成の入口。
 *
 *   npx cdk deploy                        ドメイン無しで公開（CloudFront のURLになる）
 *   npx cdk deploy -c domain=example.com  ドメインを付けて公開
 *
 * 証明書（ACM）は CloudFront の仕様で us-east-1 にしか置けないため、
 * スタックごと us-east-1 に置いている。オリジンの位置は体感に影響しない。
 */
import { App } from 'aws-cdk-lib';
import { SiteStack } from '../lib/site-stack.ts';

const app = new App();

const domainName = app.node.tryGetContext('domain') as string | undefined;
const githubRepo = (app.node.tryGetContext('repo') as string) ?? 'TrueAburis/mitamo-kitchen';

new SiteStack(app, 'MitamoKitchenSite', {
  domainName,
  githubRepo,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  description: 'みたもっちゃんねる 公式サイト（S3 + CloudFront）',
});
