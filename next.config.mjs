/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発中、同じWi-Fi内のスマホ実機から確認できるようにするための設定（開発サーバー専用）
  allowedDevOrigins: ['192.168.100.64', '100.64.1.36'],
};

export default nextConfig;
