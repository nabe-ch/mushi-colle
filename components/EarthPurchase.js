'use client';

// 月のショップで「地球」を買ったあとの、メッセージと画像（3ページ。ユーザー指定：「誰のものでもない」というニュアンスで、
// ユニークでくすっと笑えるけど、むかつくメッセージ）
import { useEffect, useMemo, useState } from 'react';
import { earthGrid } from '@/lib/bugArtMoon';
import { playWomp } from '@/lib/sound';
import InsectArt from './InsectArt';

const PAGES = [
  {
    mood: 'ribbon',
    title: 'お買い上げ、ありがとうございます！',
    text: '地球を、ご購入いただきました。',
    sub: 'ラッピングは無料です。',
    button: 'わーい',
  },
  {
    mood: 'smug',
    title: '……と言いたいところですが。',
    text: '地球は、誰のものでもありません。',
    sub: '売っていいものでは、なかったようです。',
    button: 'え？',
  },
  {
    mood: 'tongue',
    title: 'ルナは、おいしくいただきました。',
    text: '返金は、できません。',
    sub: '領収書　但し書き：「誰のものでもないもの」として　／　※お気持ちは、無料でお持ち帰りいただけます',
    button: '…そうですか',
  },
];

export default function EarthPurchase({ onClose }) {
  const [page, setPage] = useState(0);
  const arts = useMemo(() => PAGES.map((p) => earthGrid(p.mood)), []);
  const p = PAGES[page];

  useEffect(() => {
    if (page === 1) playWomp();
  }, [page]);

  return (
    <div className="earth-overlay" role="dialog">
      <div className="earth-card">
        <div className={`earth-art earth-art-${page}`}>
          <InsectArt rows={arts[page]} dot={7} />
        </div>
        <p className="earth-title">{p.title}</p>
        <p className="earth-text">{p.text}</p>
        <p className="earth-sub">{p.sub}</p>
        <button type="button" className="btn" onClick={() => (page < PAGES.length - 1 ? setPage(page + 1) : onClose())}>
          {p.button}
        </button>
      </div>
    </div>
  );
}
