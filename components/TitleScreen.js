'use client';

// タイトル画面：ドット絵の場面（主人公が木を叩くと、木が揺れて、世界中の虫が舞い降りる）と、ロゴ
import { useEffect, useMemo, useRef } from 'react';
import { drawRows } from '@/lib/pixel';
import { heroGrid, treeGrid } from '@/lib/sprites';
import { drawBackground, SCENE_COLS, SCENE_ROWS, SCENE_DOT } from '@/lib/scene';
import { INSECTS, REGIONS } from '@/lib/insects';
import InsectArt from './InsectArt';

const CYCLE_MS = 2600;

export default function TitleScreen({ onStart }) {
  const canvasRef = useRef(null);
  const tool = REGIONS[0].tools[0];
  const hero = useMemo(
    () => ({
      idle: heroGrid('idle', tool, 'japan'),
      windup: heroGrid('windup', tool, 'japan'),
      hit: heroGrid('hit', tool, 'japan'),
    }),
    [tool]
  );
  const tree = useMemo(() => treeGrid('kunugi'), []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const start = performance.now();
    let frameId;
    function frame(now) {
      const t = now - start;
      const phase = t % CYCLE_MS;
      drawBackground(ctx);
      // 叩くたびに、木が揺れる
      let dx = 0;
      let pose = 'windup';
      if (phase > 1500 && phase < 1800) pose = 'hit';
      else if (phase >= 1800) pose = 'idle';
      if (phase > 1500 && phase < 2400) dx = Math.round(Math.sin((phase - 1500) / 35) * 3 * Math.exp(-(phase - 1500) / 300));
      drawRows(ctx, tree, 44 + dx, 2, SCENE_DOT);
      drawRows(ctx, hero[pose], 22, 13, SCENE_DOT);
      // 舞い降りる虫（全種類を、少しずつずらして降らせる）
      INSECTS.forEach((insect, i) => {
        const speed = 0.045;
        const span = SCENE_ROWS * SCENE_DOT + 90;
        const y = ((t * speed + i * (span / INSECTS.length)) % span) - 64;
        const x = 20 + ((i * 53) % (SCENE_COLS * SCENE_DOT - 90)) + Math.sin(t / 500 + i) * 10;
        ctx.globalAlpha = y > 300 ? Math.max(0, 1 - (y - 300) / 50) : 1;
        drawRows(ctx, insect.grid, x / 2, y / 2, 2);
        ctx.globalAlpha = 1;
      });
      frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [hero, tree]);

  return (
    <div className="title-screen">
      <div className="title-frame">
        <canvas
          ref={canvasRef}
          width={SCENE_COLS * SCENE_DOT}
          height={SCENE_ROWS * SCENE_DOT}
          className="title-canvas"
        />
        <div className="title-banner">
          <h1 className="title-logo">むしコレ</h1>
          <p className="title-sub">～世界中のピクセルむしコレクション～</p>
        </div>
      </div>
      <p className="title-lead">世界の木をたたいて、虫をあつめよう。</p>
      <button type="button" className="btn btn-big title-start" onClick={onStart}>
        はじめる
      </button>
      <ul className="title-bugs">
        {INSECTS.map((insect, i) => (
          <li key={insect.id} style={{ animationDelay: `${(i % 5) * 0.15}s` }}>
            <InsectArt rows={insect.grid} dot={2} />
          </li>
        ))}
      </ul>
      <p className="title-note">ドット絵の図鑑をうめる、数分あそべるゲーム</p>
    </div>
  );
}
