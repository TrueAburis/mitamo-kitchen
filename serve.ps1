# 開発用の簡易サーバー。サイト本体ではない。
# 使い方: powershell -ExecutionPolicy Bypass -File serve.ps1
# 止めるとき: Ctrl + C
# 日本語を正しく表示するため、出力の文字コードを UTF-8 にする
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 配るのは dist/ の中身だけ。本番（S3）に置くものと同じものを見ることになる。
# リポジトリの根元を配ると、data/ や tools/ まで見えてしまい、
# 手元では動くのに本番で 404、という食い違いも起きる。
$root = Join-Path (Get-Location).Path 'dist'
if (-not (Test-Path -LiteralPath $root)) {
  Write-Host "dist/ がありません。先に npm run build を実行してください。"
  exit 1
}
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "http://localhost:$port/ で表示しています。止めるときは Ctrl + C"

$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.png'  = 'image/png'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.LocalPath).TrimStart('/')
    # ディレクトリを指されたら index.html を返す。/en/ で開けるようにするため。
    # 本番（CloudFront）でも同じ対応が要るので、ここで合わせておく。
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel = $rel + 'index.html' }
    $path = Join-Path $root $rel
    $full = [IO.Path]::GetFullPath($path)

    if ($full.StartsWith($root) -and (Test-Path -LiteralPath $full -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      if ($types.ContainsKey($ext)) { $ctx.Response.ContentType = $types[$ext] }
      else { $ctx.Response.ContentType = 'application/octet-stream' }
      $ctx.Response.Headers.Add('Cache-Control', 'no-store')
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.Close()
  }
} finally {
  $listener.Stop()
}
