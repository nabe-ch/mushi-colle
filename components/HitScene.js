'use client';

// 木を叩く場面。5秒間、クリック（タップ）を連打した回数で、叩く強さが決まる。
// キーボード（Enterなど）では操作できない：連打を受けるのは、ボタンではなく、ポインタ（マウス・タッチ）だけに反応する領域
import { useEffect, useMemo, useRef, useState } from 'react';
import { PALETTE, drawRows } from '@/lib/pixel';
import { heroGrid, treeGrid, drawAura } from '@/lib/sprites';
import { HIT_SECONDS, MAX_STRENGTH, strengthLevel } from '@/lib/game';
import { RARITY } from '@/lib/insects';
import { playTick, playHit, playCatch, playNew } from '@/lib/sound';
import { drawBackground } from '@/lib/scene';
import { playFanfare } from '@/lib/sound';
import InsectArt from './InsectArt';
import CompleteCelebration from './CompleteCelebration';

const COLS = 96;
const ROWS = 60;
const DOT = 6;
const HERO_X = 22;
const HERO_Y = 13;
const TREE_X = 44;
const TREE_Y = 2;
const HIT_MS = HIT_SECONDS * 1000;
const SHAKE_MS = 900;
const FADE_MS = 700;

export default function HitScene({ region, tool, treeSkin, outfitKey, celebrateRegion, onCelebrated, onRoll, onExit }) {
  const regionLabel = region.name;
  const treeLabel = region.tree;
  const currency = region.currency;
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('ready'); // ready | counting | hit | fade | results
  const [ui, setUi] = useState({ count: 0, left: HIT_SECONDS });
  const [results, setResults] = useState([]);
  const [index, setIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false); // 図鑑コンプリートのお祝いを表示中か（3秒）
  const [celebrated, setCelebrated] = useState(false);
  const celebrateTimerRef = useRef(null);

  // 図鑑コンプリートのお祝いを、3秒間出す
  function startCelebration() {
    setCelebrating(true);
    playFanfare();
    celebrateTimerRef.current = setTimeout(() => {
      setCelebrating(false);
      setCelebrated(true);
      onCelebrated();
    }, 3000);
  }

  useEffect(() => () => clearTimeout(celebrateTimerRef.current), []);

  const phaseRef = useRef('ready');
  const startRef = useRef(0);
  const countRef = useRef(0);
  const lastTapRef = useRef(-1000);
  const hitStartRef = useRef(0);
  const fadeStartRef = useRef(0);
  const levelRef = useRef(1);
  const particlesRef = useRef([]);
  const lastUiRef = useRef(0);
  const rolledRef = useRef(false);
  const onRollRef = useRef(onRoll);
  onRollRef.current = onRoll;

  const heroRows = useMemo(
    () => ({
      idle: heroGrid('idle', tool, outfitKey),
      windup: heroGrid('windup', tool, outfitKey),
      hit: heroGrid('hit', tool, outfitKey),
    }),
    [tool, outfitKey]
  );
  const treeRows = useMemo(() => treeGrid(treeSkin.kind, treeSkin.variant), [treeSkin.kind, treeSkin.variant]);

  function tap() {
    const now = performance.now();
    if (phaseRef.current === 'ready') {
      phaseRef.current = 'counting';
      startRef.current = now;
      countRef.current = 0;
      setPhase('counting');
    }
    if (phaseRef.current === 'counting') {
      countRef.current += 1;
      lastTapRef.current = now;
      playTick();
      setUi({ count: countRef.current, left: Math.max(0, HIT_SECONDS - (now - startRef.current) / 1000) });
    }
  }

  function reset() {
    phaseRef.current = 'ready';
    countRef.current = 0;
    rolledRef.current = false;
    particlesRef.current = [];
    setPhase('ready');
    setUi({ count: 0, left: HIT_SECONDS });
    setResults([]);
    setIndex(0);
    setCelebrated(false);
  }

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let frameId;

    function frame(now) {
      const p = phaseRef.current;
      if (p === 'counting') {
        const elapsed = now - startRef.current;
        if (elapsed >= HIT_MS) {
          levelRef.current = strengthLevel(countRef.current, tool);
          phaseRef.current = 'hit';
          hitStartRef.current = now;
          particlesRef.current = Array.from({ length: 28 }, () => ({
            x: TREE_X + 6 + Math.random() * 32,
            y: TREE_Y + 8 + Math.random() * 12,
            vx: (Math.random() - 0.5) * 0.012,
            ch: ['g', 'G', 'y'][Math.floor(Math.random() * 3)],
          }));
          playHit(levelRef.current);
          setPhase('hit');
          setUi({ count: countRef.current, left: 0 });
        } else if (now - lastUiRef.current > 80) {
          lastUiRef.current = now;
          setUi({ count: countRef.current, left: Math.max(0, HIT_SECONDS - elapsed / 1000) });
        }
      } else if (p === 'hit' && now - hitStartRef.current >= SHAKE_MS) {
        phaseRef.current = 'fade';
        fadeStartRef.current = now;
        setPhase('fade');
      } else if (p === 'fade' && now - fadeStartRef.current >= FADE_MS && !rolledRef.current) {
        rolledRef.current = true;
        phaseRef.current = 'results';
        setResults(onRollRef.current(levelRef.current));
        setIndex(0);
        setPhase('results');
      }

      // 描画
      const cur = phaseRef.current;
      drawBackground(ctx, region.scene);
      let dx = 0;
      let alpha = 1;
      let pose = 'idle';
      if (cur === 'counting') {
        const since = now - lastTapRef.current;
        pose = since < 90 ? 'hit' : 'windup';
        if (since < 120) dx = Math.floor(since / 30) % 2 === 0 ? 1 : -1;
      } else if (cur === 'hit') {
        const t = now - hitStartRef.current;
        pose = t < 500 ? 'hit' : 'idle';
        dx = Math.round(Math.sin(t / 35) * (2 + levelRef.current) * Math.exp(-t / 300));
      } else if (cur === 'fade') {
        alpha = Math.max(0, 1 - (now - fadeStartRef.current) / FADE_MS);
      } else if (cur === 'results') {
        alpha = 0;
      }
      if (alpha > 0) {
        ctx.globalAlpha = alpha;
        drawRows(ctx, treeRows, TREE_X + dx, TREE_Y, DOT);
        // 落ち葉
        if (cur === 'hit' || cur === 'fade') {
          const t = now - hitStartRef.current;
          for (const q of particlesRef.current) {
            const y = q.y + 0.5 * 0.00008 * t * t;
            if (y < 52) {
              ctx.fillStyle = PALETTE[q.ch];
              ctx.fillRect(Math.round((q.x + q.vx * t) * DOT), Math.round(y * DOT), DOT, DOT);
            }
          }
        }
        ctx.globalAlpha = 1;
      }
      drawRows(ctx, heroRows[pose], HERO_X, HERO_Y, DOT);
      drawAura(ctx, tool, pose, HERO_X, HERO_Y, DOT, now);
      frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [tool, region, heroRows, treeRows]);

  const current = results[index];
  useEffect(() => {
    if (phase !== 'results' || !current) return;
    if (current.isNew) playNew();
    else playCatch();
  }, [phase, index, current]);

  const level = strengthLevel(ui.count, tool);

  return (
    <div className="hit-scene">
      <p className="hit-title">
        {regionLabel}の{treeLabel}
      </p>
      <div className="hit-stage">
        <div
          className="hit-area"
          onPointerDown={tap}
          onContextMenu={(e) => e.preventDefault()}
        >
          <canvas ref={canvasRef} width={COLS * DOT} height={ROWS * DOT} className="hit-canvas" />
        </div>

        {phase === 'ready' && (
          <div className="hit-prompt">
            <p className="hit-prompt-main">タップ（クリック）で、木をたたこう！</p>
            <p className="hit-prompt-sub">最初のタップから{HIT_SECONDS}秒間、連打！多いほど強くたたけます</p>
          </div>
        )}

        {phase === 'results' && current && (
          <div className="catch-overlay">
            <div className="catch-card">
              <p className="catch-counter">
                {index + 1} / {results.length}
              </p>
              {current.isNew && <p className="catch-new">NEW!</p>}
              <div className="catch-art">
                <InsectArt rows={current.insect.grid} dot={6} />
              </div>
              <p className="catch-name">{current.insect.name}を捕まえた！</p>
              <p className="catch-rarity" style={{ color: RARITY[current.insect.rarity].color }}>
                {RARITY[current.insect.rarity].label}
              </p>
              <p className="catch-coin">+{current.price}{currency}</p>
              {index < results.length - 1 ? (
                <button type="button" className="btn" onClick={() => setIndex(index + 1)}>
                  つぎへ
                </button>
              ) : celebrateRegion && !celebrated ? (
                <button type="button" className="btn" onClick={startCelebration} disabled={celebrating}>
                  つぎへ
                </button>
              ) : (
                <div className="catch-buttons">
                  <button type="button" className="btn" onClick={reset}>
                    もう一回たたく
                  </button>
                  <button type="button" className="btn btn-sub" onClick={onExit}>
                    地図にもどる
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="hit-status">
        <div className="hit-timer">
          <div className="hit-timer-fill" style={{ width: `${(ui.left / HIT_SECONDS) * 100}%` }} />
        </div>
        <p className="hit-count">
          {phase === 'ready' ? `使う道具：${tool.name}` : `連打：${ui.count}回`}
        </p>
        <p className="hit-strength">
          強さ
          {Array.from({ length: MAX_STRENGTH }, (_, i) => (
            <span key={i} className={`strength-block${i < level && phase !== 'ready' ? ' strength-block-on' : ''}`} />
          ))}
        </p>
      </div>

      {celebrating && celebrateRegion && <CompleteCelebration region={celebrateRegion} />}

      {phase === 'ready' && (
        <button type="button" className="btn btn-sub hit-back" onClick={onExit}>
          地図にもどる
        </button>
      )}
    </div>
  );
}
