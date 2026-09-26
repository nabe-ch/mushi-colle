'use client';

// エンディングムービー（すべての地域の図鑑をコンプリートしたあと、最後の地域のお祝いのあとに流れる。約70秒。スキップできる）。
// 構成：①タイトル ②5地域をめぐる旅（木をたたいて、その地域の虫15種が集まる）③全75種のパレード
//        ④ユニークな（架空の）15種のスポットライト ⑤花火とTHE END
import { useEffect, useMemo, useRef, useState } from 'react';
import { drawRows } from '@/lib/pixel';
import { heroGrid, treeGrid, crownGrid, drawAura } from '@/lib/sprites';
import { drawBackground, SCENE_COLS, SCENE_ROWS, SCENE_DOT } from '@/lib/scene';
import { REGIONS, INSECTS, insectsOfRegion } from '@/lib/insects';
import { currentTool, currentCosmetic } from '@/lib/game';
import { playFanfare, playCatch, playNew } from '@/lib/sound';

const W = SCENE_COLS * SCENE_DOT;
const H = SCENE_ROWS * SCENE_DOT;

// ユニークな虫の、ひとこと（架空の虫たちのキャラクター）
const QUIPS = {
  jp_natsuyasumi: '宿題は、8月31日にやる派。',
  jp_kotatsu: 'こたつから出たら、負けだと思っている。',
  jp_hanabi: 'いつも、ドーンと一発ぶちあげたい。',
  eu_teatime: '3時のおやつだけは、絶対にゆずらない。',
  eu_cheese: '今日も穴だらけ。でも気にしない。',
  eu_clock: '時間には厳しい。たまに5分ずれるけど。',
  am_hammock: '起きているのは、寝返りのときだけ。',
  am_lifting: 'あと1回で、新記録なのだ。',
  am_mate: 'まずは一杯。考えるのは、それから。',
  sea_karaoke: 'マイクは、ぜったいに離さない。',
  sea_tuktuk: 'どこまででも乗せていくよ（乗客ゼロ）。',
  sea_durian: 'においは、個性です。',
  af_baobab: '非常用のお水は、もう飲んじゃった。',
  af_safari: '見つける動物より、撮られる側。',
  af_kilimanjaro: '頂上の景色は、雲で見えない。',
};

const TITLE_MS = 3200;
const REGION_MS = 4800;
const PARADE_MS = 11000;
const UNIQUE_MS = 1700;

function easeOut(p) {
  return 1 - (1 - p) * (1 - p);
}

export default function EndingMovie({ save, onClose }) {
  const canvasRef = useRef(null);
  const [caption, setCaption] = useState({ main: '', sub: '' });
  const [finished, setFinished] = useState(false);
  const captionKeyRef = useRef('');
  const soundKeyRef = useRef('');

  // 5地域ぶんの絵（木・主人公・虫）を用意する
  const regionData = useMemo(
    () =>
      REGIONS.map((region) => {
        const tool = currentTool(save, region.id);
        const treeSkin = currentCosmetic(save, region.id, 'tree');
        const outfit = currentCosmetic(save, region.id, 'outfit').key;
        return {
          region,
          tool,
          tree: treeGrid(treeSkin.kind, treeSkin.variant),
          hero: {
            idle: heroGrid('idle', tool, outfit),
            windup: heroGrid('windup', tool, outfit),
            hit: heroGrid('hit', tool, outfit),
          },
          bugs: insectsOfRegion(region.id),
        };
      }),
    [save]
  );
  const allBugs = useMemo(() => REGIONS.flatMap((r) => insectsOfRegion(r.id)), []);
  const uniques = useMemo(() => allBugs.filter((b) => b.rarity === 'unique'), [allBugs]);
  const crown = useMemo(() => crownGrid(), []);
  const totalCatches = Object.values(save.dex).reduce((sum, v) => sum + (v?.count || 0), 0);

  // 各場面の開始時刻
  const REGION_START = TITLE_MS;
  const PARADE_START = REGION_START + REGION_MS * REGIONS.length;
  const UNIQUE_START = PARADE_START + PARADE_MS;
  const FINALE_START = UNIQUE_START + UNIQUE_MS * uniques.length;

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const start = performance.now();
    let frameId;
    let bursts = [];
    let lastBurst = 0;

    function setCap(key, main, sub) {
      if (captionKeyRef.current === key) return;
      captionKeyRef.current = key;
      setCaption({ main, sub });
    }
    function sound(key, fn) {
      if (soundKeyRef.current === key) return;
      soundKeyRef.current = key;
      fn();
    }

    function drawTitle(lt) {
      ctx.fillStyle = '#1b1608';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++) {
        const x = (i * 97) % W;
        const y = (i * 53) % H;
        if (Math.floor(lt / 200 + i) % 3 === 0) {
          ctx.fillStyle = '#ffe08a';
          ctx.fillRect(x, y, 6, 6);
        }
      }
      const pop = Math.min(1, lt / 600);
      const dot = Math.max(1, Math.round(9 * easeOut(pop)));
      drawRows(ctx, crown, (W / 2 - 8 * dot) / dot, (H / 2 - 6 * dot - 20) / dot, dot);
      setCap('title', '世界中の虫を、ぜんぶあつめた！', 'おめでとう！　図鑑、完全コンプリート');
      sound('title', playFanfare);
    }

    function drawRegion(lt, idx) {
      const d = regionData[idx];
      const region = d.region;
      drawBackground(ctx, region.scene);
      const cycle = lt % 1000;
      const hitting = lt < 3400;
      const pose = hitting ? (cycle < 600 ? 'windup' : cycle < 800 ? 'hit' : 'idle') : 'idle';
      let dx = 0;
      if (hitting && cycle >= 600) dx = Math.round(Math.sin((cycle - 600) / 30) * 3 * Math.exp(-(cycle - 600) / 200));
      drawRows(ctx, d.tree, 44 + dx, 2, SCENE_DOT);
      drawRows(ctx, d.hero[pose], 22, 13, SCENE_DOT);
      drawAura(ctx, d.tool, pose, 22, 13, SCENE_DOT, performance.now());
      // 虫が、木から落ちてきて、地面に並ぶ
      d.bugs.forEach((bug, i) => {
        const p = (lt - (600 + i * 180)) / 900;
        if (p < 0) return;
        const targetX = 28 + i * 36;
        const startX = 380 + (i % 5) * 20;
        const x = p >= 1 ? targetX : startX + (targetX - startX) * easeOut(p);
        const y = p >= 1 ? 250 : 60 + 190 * p * p;
        drawRows(ctx, bug.grid, x, y, 1);
      });
      if (lt > 3900) {
        const pop = Math.min(1, (lt - 3900) / 400);
        const dot = Math.max(1, Math.round(5 * easeOut(pop)));
        drawRows(ctx, crown, 16 / dot, 14 / dot, dot);
      }
      setCap('region' + idx, region.name, d.bugs.length + '種、コンプリート！');
      sound('region' + idx, playNew);
    }

    function drawParade(lt) {
      drawBackground(ctx, { sky: '#f2a05a', sky2: '#f6b878', hill: '#b0704a', ground: '#6b8f4e', ground2: '#587f42', sun: '#ffe9a8' });
      const speed = (allBugs.length * 72 + W + 64) / PARADE_MS;
      allBugs.forEach((bug, i) => {
        const x = -64 + lt * speed - i * 72;
        if (x < -70 || x > W + 4) return;
        const y = 190 + Math.sin(lt / 120 + i) * 5;
        drawRows(ctx, bug.grid, x / 2, y / 2, 2);
      });
      setCap('parade', 'みんな、ありがとう！', '集めた虫、全' + allBugs.length + '種');
    }

    function drawUnique(lt) {
      const idx = Math.min(uniques.length - 1, Math.floor(lt / UNIQUE_MS));
      const local = lt - idx * UNIQUE_MS;
      const bug = uniques[idx];
      ctx.fillStyle = '#0d1a24';
      ctx.fillRect(0, 0, W, H);
      // スポットライト（台形）と、ステージ
      ctx.fillStyle = 'rgba(255, 224, 138, 0.16)';
      ctx.beginPath();
      ctx.moveTo(W / 2 - 40, 0);
      ctx.lineTo(W / 2 + 40, 0);
      ctx.lineTo(W / 2 + 190, H - 70);
      ctx.lineTo(W / 2 - 190, H - 70);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2a4a38';
      ctx.fillRect(0, H - 70, W, 70);
      ctx.fillStyle = 'rgba(255, 224, 138, 0.25)';
      ctx.fillRect(W / 2 - 190, H - 70, 380, 10);
      // 踊る虫
      const bounce = -Math.abs(Math.sin(local / 160)) * 22;
      const tilt = Math.sin(local / 210) * 0.1;
      ctx.save();
      ctx.translate(W / 2, 152 + bounce);
      ctx.rotate(tilt);
      drawRows(ctx, bug.grid, -128 / 8, -128 / 8, 8);
      ctx.restore();
      setCap('unique' + idx, bug.name, '「' + (QUIPS[bug.id] || '') + '」');
      sound('unique' + idx, playCatch);
    }

    function drawFinale(lt) {
      ctx.fillStyle = '#0a1220';
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = Math.floor(lt / 300 + i) % 4 === 0 ? '#ffffff' : '#39506a';
        ctx.fillRect((i * 131) % W, (i * 71) % (H - 80), 3, 3);
      }
      // 花火
      if (lt - lastBurst > 550) {
        lastBurst = lt;
        const cx = 80 + Math.random() * (W - 160);
        const cy = 50 + Math.random() * 130;
        const color = ['#ffe08a', '#ff8fa0', '#8fd0ec', '#b8f08f'][Math.floor(Math.random() * 4)];
        bursts.push({ born: lt, cx, cy, color, n: 26 });
      }
      bursts = bursts.filter((b) => lt - b.born < 1400);
      for (const b of bursts) {
        const age = (lt - b.born) / 1000;
        for (let k = 0; k < b.n; k++) {
          const a = (k / b.n) * Math.PI * 2;
          const r = 90 * easeOut(Math.min(1, age / 0.9));
          const x = b.cx + Math.cos(a) * r;
          const y = b.cy + Math.sin(a) * r + 40 * age * age;
          ctx.globalAlpha = Math.max(0, 1 - age / 1.4);
          ctx.fillStyle = b.color;
          ctx.fillRect(Math.round(x), Math.round(y), 5, 5);
        }
        ctx.globalAlpha = 1;
      }
      const bob = Math.round(Math.sin(lt / 300) * 4);
      drawRows(ctx, crown, (W / 2 - 64) / 8, (150 + bob) / 8, 8);
      setCap('finale', 'THE END', '遊んでくれて、ありがとう！ また、いつでも会いに来てね。');
      sound('finale', playFanfare);
      if (lt > 800) setFinished(true);
    }

    function frame(now) {
      const t = now - start;
      if (t < TITLE_MS) drawTitle(t);
      else if (t < PARADE_START) {
        const rt = t - REGION_START;
        drawRegion(rt % REGION_MS, Math.floor(rt / REGION_MS));
      } else if (t < UNIQUE_START) drawParade(t - PARADE_START);
      else if (t < FINALE_START) drawUnique(t - UNIQUE_START);
      else drawFinale(t - FINALE_START);
      frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [regionData, allBugs, uniques, crown, PARADE_START, UNIQUE_START, FINALE_START]);

  return (
    <div className="ending-overlay">
      <div className="ending-stage">
        <canvas ref={canvasRef} width={W} height={H} className="ending-canvas" />
        <div className="ending-caption">
          <p className="ending-caption-main">{caption.main}</p>
          <p className="ending-caption-sub">{caption.sub}</p>
          {finished && (
            <>
              <p className="ending-stats">
                集めた虫：{Object.keys(save.dex).length} / {INSECTS.length}種　捕まえた数：{totalCatches}匹
              </p>
              <div className="ending-buttons">
                <button type="button" className="btn" onClick={onClose}>
                  行き先にもどる
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {!finished && (
        <button type="button" className="btn btn-small btn-sub ending-skip" onClick={onClose}>
          スキップ
        </button>
      )}
    </div>
  );
}
