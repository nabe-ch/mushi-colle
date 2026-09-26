import './globals.css';
import RegisterSW from '@/components/RegisterSW';

export const metadata = {
  title: 'むしコレ ～世界中のピクセルむしコレクション～',
  description: '世界の木をたたいて虫をあつめる、ドット絵の図鑑コンプリートゲーム',
  // ホーム画面・デスクトップに追加できるWebアプリ（PWA）の設定。ブラウザの枠なし（standalone）で開く
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: { capable: true, title: 'むしコレ', statusBarStyle: 'black-translucent' },
};

export const viewport = {
  themeColor: '#14261c',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
