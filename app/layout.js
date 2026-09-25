import './globals.css';

export const metadata = {
  title: 'むしコレ ～世界中のピクセルむしコレクション～',
  description: '世界の木をたたいて虫をあつめる、ドット絵の図鑑コンプリートゲーム（開発中）',
};

export const viewport = {
  themeColor: '#14261c',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
