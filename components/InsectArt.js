'use client';

import { useEffect, useRef } from 'react';
import { drawRows, gridSize } from '@/lib/pixel';

// 虫のドット絵を、canvasに描く。dot は1ドットの大きさ（px）
export default function InsectArt({ rows, dot = 4, unknown = false }) {
  const canvasRef = useRef(null);
  const { cols, rows: rowCount } = gridSize(rows);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (unknown) {
      // 未発見：黒いシルエットにする
      drawRows(ctx, rows, 0, 0, dot, new Proxy({}, { get: () => '#0d1a12' }));
    } else {
      drawRows(ctx, rows, 0, 0, dot);
    }
  }, [rows, dot, unknown]);

  return (
    <canvas
      ref={canvasRef}
      width={cols * dot}
      height={rowCount * dot}
      className="insect-art"
      style={{ width: cols * dot, height: rowCount * dot }}
    />
  );
}
