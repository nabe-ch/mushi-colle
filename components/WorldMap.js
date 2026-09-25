'use client';

// 世界地図（ドット絵）。5つの地域のピンから、行き先を選ぶ。まだ作っていない地域は「準備中」
import { useEffect, useRef } from 'react';
import { REGIONS } from '@/lib/insects';
import { ellipse, createGrid } from '@/lib/pixel';
import { crownGrid } from '@/lib/sprites';
import InsectArt from './InsectArt';

const COLS = 96;
const ROWS = 48;
const DOT = 6;

// 大陸のざっくりした形（楕円の組み合わせ）
const LAND = [
  [20, 15, 12, 8], [26, 25, 5, 4], [17, 22, 4, 3], // 北米
  [31, 36, 6, 10], // 南米
  [50, 14, 6, 4], // ヨーロッパ
  [50, 30, 7, 10], // アフリカ
  [70, 15, 18, 8], [76, 30, 6, 4], // アジア・東南アジア
  [88, 18, 2, 4], // 日本
  [83, 40, 6, 4], // オーストラリア
];

function drawMap(ctx) {
  const g = createGrid(COLS, ROWS);
  for (const [cx, cy, rx, ry] of LAND) ellipse(g, cx, cy, rx, ry, 'L');
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const isLand = g[y][x] === 'L';
      ctx.fillStyle = isLand ? ((x + y) % 5 === 0 ? '#4d7a3d' : '#5c8a4a') : (x + y) % 6 === 0 ? '#3b7fa8' : '#2f6f8f';
      ctx.fillRect(x * DOT, y * DOT, DOT, DOT);
    }
  }
}

// completed：図鑑をコンプリートした地域のID（王冠を付ける）
export default function WorldMap({ onSelect, completed = [] }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawMap(canvas.getContext('2d'));
  }, []);

  return (
    <div className="world-map">
      <canvas ref={canvasRef} width={COLS * DOT} height={ROWS * DOT} className="world-map-canvas" />
      {REGIONS.map((region) => (
        <button
          key={region.id}
          type="button"
          className={`map-pin${region.available ? '' : ' map-pin-locked'}`}
          style={{ left: `${region.pin.x}%`, top: `${region.pin.y}%` }}
          disabled={!region.available}
          onClick={() => onSelect(region.id)}
        >
          {completed.includes(region.id) && (
            <span className="map-crown" aria-label="図鑑コンプリート">
              <InsectArt rows={crownGrid()} dot={2} />
            </span>
          )}
          <span className="map-pin-dot" />
          <span className="map-pin-label">
            {region.name}
            {!region.available && <small>準備中</small>}
          </span>
        </button>
      ))}
    </div>
  );
}
