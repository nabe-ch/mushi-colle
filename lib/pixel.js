// ドット絵を、コードで組み立てるための小さな道具（ピクセリウムの GameHeaderBanner.js と同じ発想）。
// 1ドット＝1文字。'.' は透明。文字と色の対応は PALETTE で決める
export const PALETTE = {
  k: '#2e2620', // 黒（目・輪郭）
  n: '#1c1a24', // 漆黒（オオクワガタの体）
  e: '#3d3a48', // 濃いグレー（体の溝・つや）
  w: '#fbf4e8', // 白（クリーム寄り）
  W: '#ffffff', // 白（つやのハイライト）
  r: '#8a5a35', // 茶
  R: '#5a3a20', // 濃い茶
  B: '#a04a28', // 赤茶（カブトムシ）
  h: '#b8752f', // 飴色（ノコギリクワガタ）
  o: '#e8823c', // オレンジ
  y: '#e0c04a', // 黄
  t: '#d9b86a', // 麦わら
  g: '#5c8a4a', // 緑
  G: '#35602f', // 濃い緑
  l: '#8fd0ec', // 水色
  b: '#5c8ac9', // 青
  p: '#c98aa0', // ピンク
  d: '#8a3535', // 深い赤
  f: '#e8b98c', // 肌色
  s: '#c9c9c9', // 銀
  m: '#7a4b8a', // 紫
  v: '#8a5cc9', // 明るい紫
  X: '#d63a2f', // 明るい赤
  q: '#8fc45c', // 明るい黄緑
};

export function createGrid(width, height) {
  return Array.from({ length: height }, () => Array(width).fill('.'));
}

export function put(g, x, y, ch) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (py >= 0 && py < g.length && px >= 0 && px < g[0].length) g[py][px] = ch;
}

export function rect(g, x, y, w, h, ch) {
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) put(g, x + c, y + r, ch);
}

export function ellipse(g, cx, cy, rx, ry, ch) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) put(g, x, y, ch);
    }
  }
}

// 直線（thick で太さ。n を指定すると、n×n のドットで塗る）
export function line(g, x0, y0, x1, y1, ch, thick = 1) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const off = Math.floor((thick - 1) / 2);
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const y = y0 + ((y1 - y0) * i) / steps;
    for (let a = 0; a < thick; a++) {
      for (let b = 0; b < thick; b++) put(g, x - off + a, y - off + b, ch);
    }
  }
}

// 左右対称に描く（幅 width の真ん中で反転）
export function mirrorX(g) {
  const w = g[0].length;
  return g.map((row) => row.map((_, c) => row[w - 1 - c]));
}

export function toRows(g) {
  return g.map((row) => row.join(''));
}

export function gridSize(rows) {
  return { cols: Math.max(...rows.map((r) => r.length)), rows: rows.length };
}

// rows（文字の配列）を、canvasに描く。left/top はドット単位、dot は1ドットの大きさ（px）
export function drawRows(ctx, rows, left, top, dot, palette = PALETTE) {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === '.') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round((left + c) * dot), Math.round((top + r) * dot), dot, dot);
    }
  }
}
