# 写真の置き場所

`assets/images/<slug>.jpg` に置く。`npm run build` で `dist/images/` に写される。

- ファイル名は `data/recipes.ts` の `image` と合わせる（例：`tori-negi-meshi.jpg`）
- プロフィール写真は `profile.jpg`
- 1:1 / 4:5 / 9:16 のどれが来ても枠が崩れないようにしてあるので、
  Instagram の投稿をそのまま使ってよい

まだ無い写真については、画面に「写真がまだありません」とファイル名が出る。
空の `<img>` は置かない（画像切れになるため）。

このファイルは、写真が1枚も無いあいだフォルダを git に残しておくためにも置いている。
