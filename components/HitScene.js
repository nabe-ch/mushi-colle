'use client';

// 木を叩く場面。5秒間、クリック（タップ）を連打した回数で、叩く強さが決まる。
// キーボード（Enterなど）では操作できない：連打を受けるのは、ボタンではなく、ポインタ（マウス・タッチ）だけに反応する領域
import { useEffect, useMemo, useRef, useState } from 'react';
import { PALETTE, drawRows } from '@/lib/pixel';
import { heroGrid, treeGrid } from '@/lib/sprites';
import { HIT_SECONDS, MAX_STRENGTH, strengthLevel } from '@/lib/game';
import { RARITY } from '@/lib/insects';
import { playTick, playHit, playCatch, playNew } from '@/lib/sound';
import InsectArt from './InsectArt';

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

function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * DOT, y * DOT, w * DOT, h * DOT);
}

function drawBackground(ctx) {
  fill(ctx, 0, 0, COLS, 46, '#8fd0ec');
  for (const y of [6, 14, 22, 30]) fill(ctx, 0, y, COLS, 2, '#a5dcf2');
  // 太陽
  fill(ctx, 8, 5, 6, 6, '#f6e27a');
  // 遠くの山
  for (let x = 0; x < COLS; x++) {
    const h = 8 + Math.round(5 * Math.sin(x / 9) + 3 * Math.sin(x / 4));
    fill(ctx, x, 44 - h, 1, h + 2, '#7fb069');
  }
  // 地面
  fill(ctx, 0, 46, COLS, 14, '#5c8a4a');
  for (let i = 0; i < 40; i++) {
    const x = (i * 37) % COLS;
    const y = 47 + ((i * 11) % 12);
    fill(ctx, x, y, 3, 1, '#4d7a3d');
  }
}

export default function HitScene({ regionLabel, treeLabel, tool, onRoll, onExit }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('ready'); // ready | counting | hit | fade | results
  const [ui, setUi] = useState({ count: 0, left: HIT_SECONDS });
  const [results, setResults] = useState([]);
  const [index, setIndex] = useState(0);

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

  const hammerColor = tool.color;
  const heroRows = useMemo(
    () => ({
      idle: heroGrid('idle', hammerColor),
      windup: heroGrid('windup', hammerColor),
      hit: heroGrid('hit', hammerColor),
    }),
    [hammerColor]
  );
  const treeRows = useMemo(() => treeGrid(), []);

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
      drawBackground(ctx);
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
      frameId = requestAnimationFrame(frame);
    }
    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [tool, heroRows, treeRows]);

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
              <p className="catch-coin">+{current.price} コイン</p>
              {index < results.length - 1 ? (
                <button type="button" className="btn" onClick={() => setIndex(index + 1)}>
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

      {phase === 'ready' && (
        <button type="button" className="btn btn-sub hit-back" onClick={onExit}>
          地図にもどる
        </button>
      )}
    </div>
  );
}
