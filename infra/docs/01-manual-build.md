# AWS を手で作る（フェーズ1）

アカウントを作るところから、作って、確かめて、壊すところまで。

**なぜ手で作るのか。** このあと同じものを Terraform で書く。
先に手を動かしておくと、コードの1行ずつが何のためにあるか分かる。
手で作ったときに**間違えた箇所**が、そのままコード化する理由になる。

> **画面の文言は変わる。** ここに書いたボタン名が違っていたら、
> 画面に出ている言葉を優先すること。**入れる値のほうが本体**で、
> たどり方は変わってもよい。迷ったら文言をそのまま伝えてほしい。

---

## 全体の流れ

```
準備        1〜5    アカウント・安全装置・CLI
手で作る    6〜13   S3 → Function → ヘッダー → 配信 → 権限
確かめる    14      動作確認と、記録を残す
壊す        15      依存の逆順に削除
```

所要時間の目安：準備40分／構築60〜90分（うち待ち時間15分）／削除20分

費用：ドメインを付けなければ Route53 は作られない。
S3 と CloudFront はこの規模なら無料枠にほぼ収まる。
ただし**保証はできない**ので、手順3の予算アラートは必ず入れること。

---

# 準備

## 1. AWS アカウントを作る

すでにあれば飛ばす。

1. https://aws.amazon.com/jp/ から「無料アカウントを作成」
2. メールアドレス・クレジットカード・電話番号の認証が要る
3. サポートプランは **ベーシック（無料）**

> アカウント作成とカード情報の入力は自分で行うこと。代行は頼まない。

## 2. ルートアカウントに MFA

コンソール右上のアカウント名 → セキュリティ認証情報 → MFA を有効化。
スマホの認証アプリ（Google Authenticator など）でよい。

**なぜ最初にやるか。** これが無いと、メールとパスワードだけで
アカウント内の全部を消せる状態が続く。以降、ルートは使わない。

## 3. 予算アラート（先にやる）

**手で作ると消し忘れが起きる。** 気づける状態にしてから先へ進む。

### 先に言葉の意味

画面でつまずくのはこの3つ。

| 言葉 | 意味 |
|---|---|
| **テンプレート** | よくある設定の型。選ぶと細かい項目が埋まった状態で始まる。自分で1から決める「カスタマイズ」もあるが、今回はテンプレートで足りる |
| **予算（予算額）** | 「月にいくらまで」の基準額。**超えたら止まるわけではない**。この額を基準にして、何％に達したら知らせるかを決めるためのもの |
| **スコープ** | どの費用を数えるか。サービス別・リージョン別・タグ別に絞れる。**今回は絞らない（全部）** |

**予算は課金を止めない。** 知らせるだけ。AWS に「使いすぎたら自動で止める」仕組みは無い。
だから早めに気づくことがすべて。

### 手順

**Budgets は請求の画面にある。** コンソール上部の検索窓に `Budgets` と入れて開く。
（リージョンの選択は関係ない。請求は全体で1つ）

1. **「予算を作成」**
2. **予算タイプ** で **「テンプレートを使用（シンプル）」** を選ぶ
3. テンプレートの一覧から **「月次コスト予算」** を選ぶ

そのあと入れるのはこれだけ。

| 項目 | 入れる値 |
|---|---|
| 予算名 | `monthly-5usd`（何でもよい） |
| 予算額 | **5**（USD） |
| メールの送信先 | 自分のメールアドレス |

作成を押して終わり。**スコープは出てこない**（テンプレートが「全サービス」で埋めてくれる）。

### これで何が起きるか

月次コスト予算のテンプレートは、**3つの通知を自動で仕込む**。

| いつ | 何に対して |
|---|---|
| 予算額の 85% に達したとき | 実際に使った額 |
| 予算額の 100% に達したとき | 実際に使った額 |
| 月末に 100% を超えそうなとき | **予測額** |

3つめが効く。使い切る前に、**このままだと超えそうだ**という段階で届く。

### カスタマイズを選んでしまった場合

「カスタマイズ（アドバンスト）」に進んでしまったら、こう埋める。

| 項目 | 値 |
|---|---|
| 予算タイプ | **コスト予算** |
| 期間 | 月次 |
| 予算の更新タイプ | **固定** |
| 予算額 | 5 USD |
| **スコープ** | **すべての AWS サービス**（フィルターを何も足さない） |
| アラートのしきい値 | 80% ／ トリガーは **実績** ／ 送信先は自分のメール |

しきい値はあとから足せる。まず1つ作ってしまってよい。

### 気をつけること

- **予算は2つまで無料。** 3つ目から1日あたり数円かかる。1つで足りる
- **費用の反映は1日ほど遅れる。** 作った直後に $0.00 でも正常
- **メールが届くか、後で確かめる。** 迷惑メールに入ることがある
- **IAM ユーザーからは請求画面が見えないことがある。** 既定で塞がっているため。
  手順4で作ったユーザーで見たくなったら、ルートで
  「アカウント」→「IAM ユーザー/ロールによる請求情報へのアクセス」を有効にする。
  今はルートで作業しているはずなので、そのまま進めてよい

### もっと早く気づきたいなら

テンプレートには **「ゼロ支出予算」** もある。
**1円でも課金されたら知らせる**もので、「無料枠に収まっているはず」を確かめたいときに向く。

ただし今回は CloudFront と S3 で数円は発生するので、すぐ鳴る。
鳴ることで「課金が始まった」と分かるのは利点だが、
鳴りっぱなしになるのが嫌なら月次5USDだけでよい。

## 4. 作業用の IAM ユーザーとアクセスキー

IAM → ユーザー → ユーザーを作成

- ユーザー名：`aburis-admin` など
- 許可：**ポリシーを直接アタッチ** → `AdministratorAccess`
  - テスト用の割り切り。本番運用なら権限を絞るが、
    CDK/Terraform は多くの権限を要求するので最初は管理者が現実的

作成後、そのユーザー → セキュリティ認証情報 → **アクセスキーを作成**
→ 用途は **コマンドラインインターフェイス (CLI)**

⚠️ シークレットキーは**この画面でしか見られない**。閉じる前にコピーする。
⚠️ **キーを人に渡さない。** 次の手順で自分の PC に直接入れる。

## 5. AWS CLI を入れて、認証を通す

```bash
winget install Amazon.AWSCLI
```

入れたら**ターミナルを開き直す**（PATH の反映のため）。

```bash
aws --version
```

`aws-cli/2.x.x` が出れば成功。続けて:

```bash
aws configure
```

| 聞かれるもの | 入れるもの |
|---|---|
| AWS Access Key ID | 手順4のキーID |
| AWS Secret Access Key | 手順4のシークレットキー |
| Default region name | `us-east-1` |
| Default output format | `json` |

確認:

```bash
aws sts get-caller-identity
```

アカウントIDとユーザー名が返れば準備完了。**このアカウントIDは後で何度も使う**のでメモしておく。

> **なぜ us-east-1 なのか。** あとで独自ドメインを付けるとき、
> CloudFront の証明書（ACM）は仕様上 us-east-1 にしか置けない。
> S3 自体はどこでもよいが、最初から同じ場所に寄せておく。

---

# 手で作る

作る順番は依存関係で決まっている。この順で進める。

```
6. S3 バケット
7. CloudFront Function        ← 配信より先に作る（配信から参照するため）
8. レスポンスヘッダーポリシー   ← 同上
9. CloudFront ディストリビューション ＋ OAC
10. S3 バケットポリシー         ← 配信のIDが要るので配信の後
11. OIDC プロバイダ
12. IAM ロール                  ← バケット名と配信IDが要るので最後
13. GitHub 側の設定
```

## 6. S3 バケット

S3 → バケットを作成

| 項目 | 値 |
|---|---|
| バケット名 | `mitamo-kitchen-site-<自分で決めた文字>`（世界で一意） |
| リージョン | us-east-1 |
| パブリックアクセスをすべてブロック | **オン（4つとも）** |
| バケットのバージョニング | **有効** |
| デフォルトの暗号化 | SSE-S3（Amazon S3 マネージドキー） |

作成後 → 管理タブ → ライフサイクルルールを作成

- ルール名：`expire-old-versions`
- 適用範囲：バケット全体
- アクション：**非現行バージョンの完全削除** → **30日**

**なぜ公開を全部ブロックするのか。**
静的サイトで最も多い事故が「バケットを公開設定にして、意図しないファイルまで見られる」。
CloudFront 経由でしか読めない形にすれば、構造としてその事故が起きない。

**なぜバージョニングを入れて30日で切るのか。**
上書き事故から戻せるようにする。ただし古い版を無限に持つと課金が増える。

## 7. CloudFront Function

CloudFront → 関数 → 関数を作成

- 名前：`rewrite-index`
- ランタイム：**cloudfront-js-2.0**

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

⚠️ 書いたら **「変更を保存」→「発行」**。発行しないと配信から使えない。

**なぜ要るのか。** S3 は「ディレクトリ」という考え方を持たない。
`/en/` で来たリクエストに `/en/index.html` を返す仕組みが無いので、ここで補う。
開発用の `serve.ps1` にも同じ処理を入れて、手元と本番の挙動を合わせてある。

## 8. レスポンスヘッダーポリシー

CloudFront → ポリシー → レスポンスヘッダー → 作成

名前：`mitamo-kitchen-security-headers`

セキュリティヘッダーで以下（すべて「オリジンの値を上書き」を有効に）

| ヘッダー | 値 |
|---|---|
| Strict-Transport-Security | max-age **31536000** ／ サブドメインを含める **オン** ／ preload **オン** |
| X-Content-Type-Options | nosniff（有効にするだけ） |
| X-Frame-Options | **DENY** |
| Referrer-Policy | **strict-origin-when-cross-origin** |
| Content-Security-Policy | 下記を1行で |

```
default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; frame-src https://docs.google.com https://www.instagram.com; form-action 'self' https://docs.google.com; base-uri 'none'; object-src 'none'; frame-ancestors 'none'
```

**なぜ `script-src 'self'` まで絞れるのか。**
このサイトにはインラインの `<script>` が1つも無い。
素のHTMLで組んできた副産物で、普通のサイトは `'unsafe-inline'` を外せない。
**面接で聞かれたらここを話すとよい。**

`style-src` に `'unsafe-inline'` が残るのは、属性で書いたスタイルが数箇所あるため。
`frame-src` の2つは、お仕事のご依頼フォーム（Google）とレシピ動画（Instagram）。

## 9. CloudFront ディストリビューション ＋ OAC

CloudFront → ディストリビューションを作成

**オリジン**

| 項目 | 値 |
|---|---|
| オリジンドメイン | 手順6のバケットを選ぶ |
| オリジンアクセス | **Origin access control settings (recommended)** |
| OAC | 新しい OAC を作成 → 署名する（SigV4） |

⚠️ 作成すると **バケットポリシーをコピーするよう促される。** そのJSONを控える（手順10で使う）。

**デフォルトのキャッシュビヘイビア**

| 項目 | 値 |
|---|---|
| ビューワープロトコルポリシー | **Redirect HTTP to HTTPS** |
| 許可する HTTP メソッド | GET, HEAD |
| キャッシュポリシー | **CachingOptimized**（マネージド） |
| レスポンスヘッダーポリシー | 手順8の `mitamo-kitchen-security-headers` |
| 圧縮 | **オン** |
| 関数の関連付け → ビューワーリクエスト | **CloudFront Functions → rewrite-index** |

**設定**

| 項目 | 値 |
|---|---|
| 料金クラス | **北米・欧州・アジア**（PriceClass 200） |
| デフォルトルートオブジェクト | `index.html` |
| HTTP/3 | オン |

**カスタムエラーレスポンス**（作成後、エラーページのタブから2つ追加）

| HTTPエラーコード | レスポンスページ | レスポンスコード | TTL |
|---|---|---|---|
| 403 | `/index.html` | **404** | 300 |
| 404 | `/index.html` | **404** | 300 |

**なぜ403を404に読み替えるのか。**
バケットが非公開なので、S3 は存在しないファイルに対して403を返す。
そのまま出すと「権限が無い」に見えるが、実際は「そのページが無い」。

**なぜ料金クラス200なのか。** 見に来るのは日本が中心。
南米・オセアニアのエッジまで使うと費用が上がるが、体感は変わらない。

⚠️ 配信が始まるまで **5〜15分**かかる。ここで一度待つ。

**ディストリビューションIDとドメイン名（`dxxxxxxxxxx.cloudfront.net`）をメモする。**

## 10. S3 バケットポリシー

手順9でコピーしたポリシーを貼る。

S3 → バケット → アクセス許可 → バケットポリシー → 編集

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
        "AWS:SourceArn": "arn:aws:cloudfront::<アカウントID>:distribution/<配信ID>"
      }
    }
  }]
}
```

**ここが OAC の肝。** バケットは誰にも公開されていないが、
「このディストリビューションからの読み取りだけ」を許可している。
`AWS:SourceArn` の条件が無いと、**他人の CloudFront からも読めてしまう。**

### ここで一度、動くか確かめる

リポジトリの根元で:

```bash
npm run build
aws s3 sync dist/ s3://<バケット名>/
```

`https://dxxxxxxxxxx.cloudfront.net` を開いて、5つとも確認する。

- [ ] トップが出る
- [ ] **`/en/` が英語トップを返す** ← CloudFront Function が効いている証拠
- [ ] `/recipes.html` が開く
- [ ] 存在しないURL（`/nothing.html`）が 404 を返す
- [ ] 開発者ツール → Network → レスポンスヘッダーに `content-security-policy` が乗っている

ここが通れば、OAC も Function もヘッダーポリシーも正しく効いている。

## 11. OIDC プロバイダ

IAM → IDプロバイダ → プロバイダを追加

| 項目 | 値 |
|---|---|
| プロバイダのタイプ | OpenID Connect |
| プロバイダのURL | `https://token.actions.githubusercontent.com` |
| 対象者（Audience） | `sts.amazonaws.com` |

⚠️ **すでに同じURLのプロバイダがあるとエラーになる。**
その場合は新規作成せず、既存のものを使う（手順12の信頼ポリシーはそのまま使える）。

## 12. IAM ロール

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

- ロール名：`mitamo-kitchen-deploy`
- 最大セッション時間：**1時間**

権限は「インラインポリシーを作成」で:

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
      "Resource": "arn:aws:cloudfront::<アカウントID>:distribution/<配信ID>"
    }
  ]
}
```

**ここが設計の見どころ。**
アクセスキーを発行して GitHub に保存する方法を取っていない。
OIDC で「このリポジトリの main ブランチから来た」ことを AWS が毎回確認し、
1時間だけ有効な資格情報を渡す。**鍵がどこにも保存されないので、漏れようがない。**

`sub` を `ref:refs/heads/main` に絞っているので、別のブランチやフォークからは引き受けられない。
ここを `repo:TrueAburis/mitamo-kitchen:*` と緩めると、
**プルリクエストを送ってきた他人がこのロールを使えてしまう。**

## 13. GitHub 側の設定

`https://github.com/TrueAburis/mitamo-kitchen/settings/variables/actions`

**Variables** タブ（Secrets ではない。秘密の値ではないので）

| Name | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::<アカウントID>:role/mitamo-kitchen-deploy` |
| `AWS_S3_BUCKET` | バケット名 |
| `AWS_CLOUDFRONT_ID` | 配信ID |

Actions → deploy → Run workflow で実行。
`build` → `pages` → `aws` の3つが緑になれば、手で作った構成の完成。

---

# 確かめる

## 14. 記録を残す（ポートフォリオ用）

**削除する前に**、これだけ残す。

- [ ] 各リソースの設定画面のスクリーンショット
- [ ] 実際にかかった時間（「手で作ると◯分」がコード化の理由になる）
- [ ] 詰まった箇所と、その原因
- [ ] **手で作ったときに間違えた設定**

最後のが一番価値がある。
「人間が繰り返すと必ず間違える」がコード化の動機そのものなので、
「OACの条件を書き忘れて、他人のCloudFrontからも読める状態になっていた」のような
実際の失敗が1つあると、Terraform に移した理由が具体的に語れる。

気づいたことは、このファイルの下に追記していくとよい。

---

# 壊す

## 15. 全部消す（フェーズ2）

Terraform で作り直すので、いったん全部消す。**依存の逆順に消す。**

1. [ ] CloudFront ディストリビューションを**無効化** → 無効になるまで待つ（数分）→ 削除
2. [ ] CloudFront Function（`rewrite-index`）を削除
3. [ ] レスポンスヘッダーポリシーを削除
4. [ ] S3 バケット → **空にする**（バージョン付きオブジェクトも含める）→ バケットを削除
5. [ ] IAM ロール `mitamo-kitchen-deploy` を削除
6. [ ] OIDC プロバイダを削除（※他で使っていなければ）
7. [ ] GitHub の Variables 3つを削除（次は Terraform の出力で入れ直す）

⚠️ ディストリビューションは**無効化してからでないと削除できない。** ここで待たされる。

消し終えたら、請求ダッシュボードで課金が止まっていることを確認する。

---

次は `02-terraform.md`（フェーズ3）。同じものをコードで建てる。
