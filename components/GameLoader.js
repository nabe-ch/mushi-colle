'use client';

// localStorage を使うため、ブラウザ側だけで描画する（next/dynamic の ssr:false は Client Component 内でのみ使える）
import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => <p className="loading">読み込み中…</p>,
});

export default function GameLoader() {
  return <Game />;
}
