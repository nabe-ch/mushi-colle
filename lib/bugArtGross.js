// 「ちょっとグロテスクな有名生き物」6種のドット絵（32×32）。
// クモ・ムカデ・サソリ・タガメ。ユーザー指定（2026-09-26）：「タランチュラ、世界一大きなムカデなど、各地域、世界的に有名であれば1種追加」
import { createGrid, put, rect, ellipse, line, mirrorX, toRows } from './pixel';

const SIZE = 32;

function symmetric(drawLeft) {
  const left = createGrid(SIZE, SIZE);
  drawLeft(left);
  const right = mirrorX(left);
  const out = createGrid(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) out[y][x] = left[y][x] !== '.' ? left[y][x] : right[y][x];
  return out;
}

// クモの脚（左側4本）。fat で太さ
function spiderLegs(h, color, fat = 1, joint = null) {
  const legs = [
    [[13, 10], [8, 5], [4, 4]],
    [[12, 12], [6, 10], [2, 12]],
    [[12, 14], [6, 15], [2, 19]],
    [[13, 16], [8, 22], [5, 28]],
  ];
  for (const [a, b, c] of legs) {
    line(h, a[0], a[1], b[0], b[1], color, fat);
    line(h, b[0], b[1], c[0], c[1], color, fat);
    if (joint) put(h, b[0], b[1], joint);
  }
}

// ジョロウグモ：黄色と黒のしま模様のおなか、赤い斑点、長い脚
export function jorogumo() {
  const g = symmetric((h) => {
    spiderLegs(h, 'k', 1, 'y');
    ellipse(h, 15.5, 21, 5.2, 7.5, 'y');
    for (const y of [17, 20, 23, 26]) rect(h, 10, y, 6, 1, 'k');
    put(h, 13, 18, 'X');
    put(h, 13, 21, 'X');
    put(h, 13, 24, 'X');
    ellipse(h, 15.5, 11, 3.6, 3.4, 'k');
    put(h, 14, 9, 'W');
  });
  return toRows(g);
}

// 本家タランチュラ（ヨーロッパのコモリグモ）：茶色で、背中に黒い筋
export function wolfSpider() {
  const g = symmetric((h) => {
    spiderLegs(h, 'R', 1);
    ellipse(h, 15.5, 20, 4.8, 6.6, 'r');
    rect(h, 14, 15, 4, 11, 'R');
    for (const [x, y] of [[11, 18], [11, 22]]) put(h, x, y, 'R');
    ellipse(h, 15.5, 10, 4, 4.2, 'r');
    rect(h, 15, 7, 2, 6, 'y');
    put(h, 13, 8, 'W');
    put(h, 14, 7, 'k');
  });
  return toRows(g);
}

// ゴライアスバードイーター：毛むくじゃらで、どっしり太い脚
export function birdEater() {
  const g = symmetric((h) => {
    spiderLegs(h, 'B', 2);
    for (const [x, y] of [[8, 5], [6, 10], [6, 15], [8, 22]]) put(h, x, y, 'o');
    ellipse(h, 15.5, 21, 6.2, 7.2, 'r');
    for (const [x, y] of [[11, 18], [13, 21], [10, 23], [12, 26], [14, 17], [9, 20]]) put(h, x, y, 'o');
    ellipse(h, 15.5, 11, 5.2, 5, 'B');
    put(h, 13, 9, 'W');
    put(h, 14, 8, 'k');
    // 大きなきば
    put(h, 14, 5, 'W');
    put(h, 14, 6, 'W');
  });
  return toRows(g);
}

// ペルビアンジャイアントオオムカデ：赤い頭、うねる長い体、黄色い脚
export function giantCentipede() {
  const g = createGrid(SIZE, SIZE);
  const n = 14;
  const pts = Array.from({ length: n }, (_, i) => [16 + 8 * Math.sin(i * 0.55 + 0.4), 5 + i * 1.75]);
  // 脚（体の下に先に描く）
  pts.forEach(([x, y], i) => {
    const len = i === n - 1 ? 3 : 5;
    line(g, x - 2, y, x - len, y + 1, 'y');
    line(g, x + 2, y, x + len, y + 1, 'y');
  });
  pts.forEach(([x, y], i) => {
    ellipse(g, x, y, 2.6, 1.6, i % 2 === 0 ? 'B' : 'd');
  });
  const [hx, hy] = pts[0];
  ellipse(g, hx, hy - 1, 3, 2.4, 'X');
  put(g, hx - 1, hy - 1, 'k');
  put(g, hx + 1, hy - 1, 'k');
  line(g, hx - 2, hy - 3, hx - 5, hy - 5, 'y');
  line(g, hx + 2, hy - 3, hx + 5, hy - 5, 'y');
  return toRows(g);
}

// エンペラースコーピオン（横向き）：黒い体、大きなはさみ、そり上がる尾
export function emperorScorpion() {
  const g = createGrid(SIZE, SIZE);
  // 脚
  for (const [x0, x1] of [[9, 7], [12, 11], [15, 15], [18, 19]]) line(g, x0, 25, x1, 30, 'e');
  // 胴（節）
  ellipse(g, 13, 23, 7.5, 3.6, 'n');
  for (const x of [8, 11, 14]) line(g, x, 20, x, 26, 'e');
  ellipse(g, 19, 22, 3.4, 3, 'n');
  put(g, 21, 21, 'W');
  // 尾（後ろから、上へそり上がる）
  line(g, 7, 22, 3, 17, 'n', 2);
  line(g, 3, 17, 4, 11, 'n', 2);
  line(g, 4, 11, 9, 7, 'n', 2);
  line(g, 9, 7, 14, 7, 'n', 2);
  ellipse(g, 14, 8, 2, 2, 'n');
  put(g, 16, 10, 'X');
  put(g, 16, 11, 'X');
  put(g, 3, 14, 'e');
  put(g, 5, 9, 'e');
  // はさみ
  line(g, 21, 21, 25, 18, 'n', 2);
  ellipse(g, 27, 16, 3.2, 2.6, 'n');
  put(g, 29, 15, '.');
  line(g, 21, 24, 25, 25, 'n', 2);
  ellipse(g, 27, 26, 3.2, 2.4, 'n');
  put(g, 29, 26, '.');
  put(g, 26, 15, 'e');
  return toRows(g);
}

// タイワンタガメ：平たい茶色の体、鎌のような前脚
export function giantWaterBug() {
  const g = symmetric((h) => {
    // 脚
    line(h, 12, 8, 7, 7, 'R', 2);
    line(h, 7, 7, 6, 13, 'R', 2);
    put(h, 5, 14, 'k');
    line(h, 11, 20, 5, 24, 'R');
    line(h, 11, 23, 6, 29, 'R');
    // 体
    ellipse(h, 15.5, 17, 6.4, 10, 'R');
    ellipse(h, 15.5, 17, 5.4, 9, 'r');
    rect(h, 15, 9, 2, 17, 'R');
    for (const y of [12, 16, 20]) line(h, 11, y, 14, y + 1, 'R');
    // 頭
    ellipse(h, 15.5, 6, 3.2, 2.8, 'r');
    put(h, 13, 5, 'k');
    put(h, 13, 4, 'k');
    // 尾の呼吸管
    line(h, 15, 27, 15, 31, 'R');
  });
  return toRows(g);
}
