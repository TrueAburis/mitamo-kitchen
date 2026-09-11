# 手で作る手順（フェーズ1）

コンソールで1つずつ作る。**Terraform に書き起こす前に、何が要るのかを手で確かめるため。**

この記録自体が、あとで「なぜこの設定にしたか」を説明する材料になる。
詰まった箇所・迷った箇所は、このファイルに追記していくこと。

> **画面の文言は変わる。** ここに書いたボタン名が違っていたら、
> 画面に出ている言葉を優先すること。**入れる値のほうが本体**で、
> たどり方は変わってもよい。

作るもの（依存の順に並べてある）

```
1. S3 バケット              置き場所
2. CloudFront Function      /en/ → /en/index.html の補完
3. レスポンスヘッダーポリシー  セキュリティヘッダー
4. CloudFront ディストリビューション  ＋ OAC
5. S3 バケットポリシー       CloudFront だけに読ませる
6. OIDC プロバイダ           GitHub からの認証
7. IAM ロール                デプロイ用
```

リージョンは **us-east-1** に揃える。
S3 自体はどこでもよいが、あとで独自ドメインを付けるとき
ACM 証明書が CloudFront の仕様で us-east-1 にしか置けないため、
最初から同じ場所に寄せておく。

---

## 1. S3 バケット

S3 → バケットを作成

| 項目 | 値 |
|---|---|
| バケット名 | `mitamo-kitchen-site-<自分で決めた文字>`（世界で一意） |
| リージョン | us-east-1 |
| パブリックアクセスをすべてブロック | **オン（4つとも）** |
| バケットのバージョニング | **有効** |
| デフォルトの暗号化 | SSE-S3（Amazon S3 マネージドキー） |

作成後、そのバケットの「管理」タブ → ライフサイクルルールを作成

- ルール名：`expire-old-versions`
- 適用範囲：バケット全体
- アクション：**非現行バージョンの完全削除** → **30日**

**なぜ：** 上書き事故から戻せるようにバージョニングを入れる。
ただし古い版を無限に持つと課金が増えるので、30日で切る。
静的サイトなので容量はたかが知れている。

**なぜパブリックアクセスを全部ブロックするのか：**
静的サイトで最も多い事故が「バケットを公開設定にして、意図しないファイルまで見られる」。
CloudFront 経由でしか読めない形にすれば、構造としてその事故が起きない。

---

## 2. CloudFront Function

CloudFront → 関数 → 関数を作成

- 名前：`rewrite-index`
- ランタイム：**cloudfront-js-2.0**

コード:

```js
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }
  return request;
}
```

書いたら **「変更を保存」→「発行」**（発行しないと配信に使えない）。

**なぜ要るのか：** S3 は「ディレクトリ」という考え方を持たない。
`/en/` で来たリクエストに対して `/en/index.html` を返す仕組みが無いので、ここで補う。
開発用の `serve.ps1` にも同じ処理を入れて、手元と本番の挙動を合わせてある。

---

## 3. レスポンスヘッダーポリシー

CloudFront → ポリシー → レスポンスヘッダー → 作成

名前：`mitamo-kitchen-security-headers`

**セキュリティヘッダー** で以下を設定（すべて「オリジンの値を上書き」を有効に）

| ヘッダー | 値 |
|---|---|
| Strict-Transport-Security | max-age **31536000**（365日）／ サブドメインを含める **オン** ／ preload **オン** |
| X-Content-Type-Options | nosniff（有効にするだけ） |
| X-Frame-Options | **DENY** |
| Referrer-Policy | **strict-origin-when-cross-origin** |
| Content-Security-Policy | 下記 |

Content-Security-Policy（1行で貼る）:

```
default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; frame-src https://docs.google.com https://www.instagram.com; form-action 'self' https://docs.google.com; base-uri 'none'; object-src 'none'; frame-ancestors 'none'
```

**なぜ `script-src 'self'` まで絞れるのか：**
このサイトにはインラインの `<script>` が1つも無い。
素のHTMLで組んできた副産物で、普通のサイトは `'unsafe-inline'` を外せない。
**面接で聞かれたらここを話すとよい。**

`style-src` に `'unsafe-inline'` が残っているのは、属性で書いているスタイルが数箇所あるため。
`frame-src` の2つは、お仕事のご依頼フォーム（Google）とレシピ動画（Instagram）。

---

## 4. CloudFront ディストリビューション

CloudFront → ディストリビューションを作成

**オリジン**

| 項目 | 値 |
|---|---|
| オリジンドメイン | 1で作ったバケットを選ぶ |
| オリジンアクセス | **Origin access control settings (recommended)** |
| OAC | 「新しいOACを作成」→ 署名動作は署名する（SigV4） |

⚠️ 作成後、**「ポリシーをコピー」というボタンが出る。** そのJSONを控えておく（手順5で使う）。

**デフォルトのキャッシュビヘイビア**

| 項目 | 値 |
|---|---|
| ビューワープロトコルポリシー | **Redirect HTTP to HTTPS** |
| 許可するHTTPメソッド | GET, HEAD |
| キャッシュポリシー | **CachingOptimized**（マネージド） |
| レスポンスヘッダーポリシー | 3で作った `mitamo-kitchen-security-headers` |
| 圧縮 | **オン** |
| 関数の関連付け → ビューワーリクエスト | **CloudFront Functions → rewrite-index** |

**設定**

| 項目 | 値 |
|---|---|
| 料金クラス | **北米・欧州・アジア**（PriceClass 200） |
| デフォルトルートオブジェクト | `index.html` |
| HTTP/3 | オン |

**カスタムエラーレスポンス**（作成後、「エラーページ」タブから2つ追加）

| HTTPエラーコード | レスポンスページ | レスポンスコード | TTL |
|---|---|---|---|
| 403 | `/index.html` | **404** | 300 |
| 404 | `/index.html` | **404** | 300 |

**なぜ403を404に読み替えるのか：**
S3 は存在しないファイルに対して（バケットが非公開なので）403を返す。
そのまま出すと「権限が無い」に見えるが、実際は「そのページが無い」。
正しく404として返す。

**なぜ料金クラス200なのか：** 見に来るのは日本が中心。
南米・オセアニアのエッジまで使うと費用が上がるが、体感は変わらない。

配信が始まるまで**5〜15分**かかる。

---

## 5. S3 バケットポリシー

手順4でコピーしたポリシーを貼る。

S3 → バケット → アクセス許可 → バケットポリシー → 編集

形はこうなる（`<...>` は自分の値）:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipal",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::<バケット名>/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::<アカウントID>:distribution/<ディストリビューションID>"
      }
    }
  }]
}
```

**ここが OAC の肝。** バケットは誰にも公開されていないが、
「このディストリビューションからの読み取りだけ」を許可している。
`AWS:SourceArn` の条件が無いと、他人の CloudFront からも読めてしまう。

### ここで一度、動作を確認する

```bash
npm run build
aws s3 sync dist/ s3://<バケット名>/
```

ディストリビューションのドメイン名（`dxxxxxxxxxx.cloudfront.net`）を開く。

- トップが出るか
- **`/en/` が英語トップを返すか** ← CloudFront Function が効いている証拠
- `/recipes.html` が開くか
- 存在しないURL（`/nothing.html`）で404が返るか
- ブラウザの開発者ツール → Network → レスポンスヘッダーに `content-security-policy` が乗っているか

---

## 6. OIDC プロバイダ

IAM → IDプロバイダ → プロバイダを追加

| 項目 | 値 |
|---|---|
| プロバイダのタイプ | OpenID Connect |
| プロバイダのURL | `https://token.actions.githubusercontent.com` |
| 対象者（Audience） | `sts.amazonaws.com` |

⚠️ **すでに同じURLのプロバイダがあるとエラーになる。**
その場合は新規作成せず、既存のものを使う（手順7の信頼ポリシーはそのまま使える）。

---

## 7. IAM ロール

IAM → ロール → ロールを作成 → **カスタム信頼ポリシー**

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<アカウントID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:TrueAburis/mitamo-kitchen:ref:refs/heads/main"
      }
    }
  }]
}
```

ロール名：`mitamo-kitchen-deploy`
最大セッション時間：**1時間**

権限は「インラインポリシーを作成」で以下を貼る:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::<バケット名>/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetBucketLocation"],
      "Resource": "arn:aws:s3:::<バケット名>"
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<アカウントID>:distribution/<ディストリビューションID>"
    }
  ]
}
```

**ここが設計の見どころ。**
アクセスキーを発行して GitHub に保存する方法を取っていない。
OIDC で「このリポジトリの main ブランチから来た」ことを AWS 側が毎回確認し、
1時間だけ有効な資格情報を渡す。**鍵がどこにも保存されないので、漏れようがない。**

`sub` の条件で `ref:refs/heads/main` に絞っているので、
別のブランチや、フォークされたリポジトリからは引き受けられない。
ここを `repo:TrueAburis/mitamo-kitchen:*` と緩めると、
**プルリクエストを送ってきた他人がこのロールを使えてしまう。**

---

## 8. GitHub 側の設定

`https://github.com/TrueAburis/mitamo-kitchen/settings/variables/actions`

**Variables** タブ（Secrets ではない。秘密の値ではないので）

| Name | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::<アカウントID>:role/mitamo-kitchen-deploy` |
| `AWS_S3_BUCKET` | バケット名 |
| `AWS_CLOUDFRONT_ID` | ディストリビューションID |

Actions → deploy → Run workflow で実行。
`build` → `pages` → `aws` の3つが緑になれば、手で作った構成の完成。

---

## 9. 記録を残す（ポートフォリオ用）

削除する前に、これだけ残しておくこと。

- [ ] 各リソースの設定画面のスクリーンショット
- [ ] 実際にかかった時間（「手で作ると◯分」がコード化の理由になる）
- [ ] 詰まった箇所と、その原因
- [ ] 手で作ったときに**間違えた設定**（これが一番価値がある。
      「人間が繰り返すと必ず間違える」がコード化の動機そのものなので）

---

## 10. 壊す（フェーズ2）

Terraform で作り直すので、いったん全部消す。**依存の逆順に消す。**

1. CloudFront ディストリビューションを**無効化** → 無効になるまで待つ（数分）→ 削除
2. CloudFront Function（`rewrite-index`）を削除
3. レスポンスヘッダーポリシーを削除
4. S3 バケット → 「空にする」（バージョン付きオブジェクトも含める）→ バケットを削除
5. IAM ロール `mitamo-kitchen-deploy` を削除
6. OIDC プロバイダを削除（※他で使っていなければ）

⚠️ ディストリビューションは**無効化してからでないと削除できない**。ここで一度待たされる。

消し終えたら、コンソールの請求ダッシュボードで課金が止まっていることを確認する。
