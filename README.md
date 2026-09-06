# mitamo-kitchen

みたもっちゃんねる 公式サイト（テスト版）

出汁からはじめる和食のレシピを、日本語と英語で載せています。
作っている最中に分量が画面から消えないことを、このサイトの中心に置いています。

## 中身

| ファイル | 内容 |
|---|---|
| `index.html` | トップ（見出し・SNS・最新のレシピ・プロフィール） |
| `recipes.html` | レシピ一覧 |
| `tori-mune-nasu-nanbanzuke.html` | レシピ：鶏むね肉と茄子の南蛮漬け |
| `tori-negi-meshi.html` | レシピ：鶏ネギ飯 |
| `work.html` | お仕事のご依頼 |
| `style.css` / `script.js` | 全ページ共通 |

素のHTML・CSS・JavaScript だけで作っています。
ビルドツール、外部ライブラリ、Webフォントは使っていません。
外部への読み込みは、お仕事のご依頼ページの Google フォームだけです。

## 手元で見る

Python も Node も不要です。Windows なら次の1行で立ち上がります。

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

http://localhost:8000/ が開けるようになります。止めるときは Ctrl + C。

`serve.ps1` は確認用で、サイト本体には含まれません。

## まだ途中のところ

- 写真がまだ入っていません（`images/` が空）
- プロフィール本文は仮のものです（画面上に「仮の文章」と表示されます）
- 南蛮漬けの手順が未入力です

制作方針は `CLAUDE.md` にまとめています。
