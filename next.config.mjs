/** @type {import('next').NextConfig} */
const isExport = process.env.EXPORT === '1';

const nextConfig = {
  // 開発中、同じWi-Fi内のスマホ実機から確認できるようにするための設定（開発サーバー専用）
  allowedDevOrigins: ['192.168.100.64', '100.64.1.36'],
  // 公開用（itch.ioにアップロードする静的ファイル）：EXPORT=1 のときだけ、out/ に書き出す。
  // itch.io は、ゲームを「サイトの直下ではない場所」で表示するため、ファイルの場所は相対パス（./）にする
  ...(isExport ? { output: 'export', assetPrefix: './', images: { unoptimized: true } } : {}),
};

export default nextConfig;
