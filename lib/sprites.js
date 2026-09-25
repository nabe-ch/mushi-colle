// 主人公（虫を採集する人）と木のドット絵。pixel.js の道具でその場で組み立てる。
// 地域の格好は「その地域を訪れる採集者らしい服装」（企画書、2026-09-25決定。伝統衣装は使わない）。
// 道具の形（shape）は、地域ごとの道具（lib/insects.js の REGIONS.tools）で決まる：hammer（ハンマー型）/ axe（斧）/ stick（棒）
import { createGrid, put, rect, ellipse, line, toRows } from './pixel';

export const HERO_W = 46;
export const HERO_H = 40;
export const TREE_W = 44;
export const TREE_H = 58;

// 服装（地域ごと）
const OUTFITS = {
  japan: { hat: 'straw', shirt: 'w', vest: null, pants: 'b', legs: 'f', bag: 'g' },
  europe: { hat: 'cap', shirt: 'w', vest: 'G', pants: 'r', legs: 'r', bag: 'R' },
  // 2着目（ショップで買える。どちらも「採集者らしい服装」）
  japan2: { hat: 'safari', shirt: 'h', vest: 'r', pants: 'r', legs: 'r', bag: 'g' },
  europe2: { hat: 'rain', shirt: 'y', vest: null, pants: 'y', legs: 'y', bag: 'R' },
  // 南米・東南アジア・アフリカ（どれも「採集者らしい服装」。伝統衣装は使わない）
  amazon: { hat: 'wide', shirt: 'g', vest: 'R', pants: 'r', legs: 'r', bag: 'y' },
  amazon2: { hat: 'cap', shirt: 'b', vest: 'e', pants: 'e', legs: 'e', bag: 'g' },
  sea: { hat: 'bandana', shirt: 'w', vest: 'y', pants: 'h', legs: 'h', bag: 'g' },
  sea2: { hat: 'wide', shirt: 'l', vest: null, pants: 'b', legs: 'b', bag: 'R' },
  africa: { hat: 'wide', shirt: 'h', vest: null, pants: 't', legs: 't', bag: 'R' },
  africa2: { hat: 'bandana', shirt: 'o', vest: 'r', pants: 'r', legs: 'r', bag: 'y' },
};

// 道具を描く。pose ごとに、手の位置と柄の向きが決まり、頭の形は shape で変わる
function drawTool(g, pose, tool) {
  const color = tool.color;
  const shape = tool.shape || 'hammer';
  const handle = {
    idle: [24, 24, 24, 12],
    windup: [14, 10, 6, 2],
    hit: [29, 20, 37, 26],
  }[pose];
  line(g, handle[0], handle[1], handle[2], handle[3], 'R', 2);
  if (shape === 'stick') {
    if (pose === 'idle') rect(g, 23, 10, 3, 3, 'R');
    else if (pose === 'windup') rect(g, 4, 1, 3, 3, 'R');
    else rect(g, 37, 24, 3, 3, 'R');
  } else if (shape === 'blade') {
    // なた・パラン：柄の先に、長い刃が伸びる
    if (pose === 'idle') rect(g, 23, 1, 3, 10, color);
    else if (pose === 'windup') rect(g, 0, 0, 6, 2, color);
    else line(g, 37, 26, 43, 31, color, 3);
  } else if (shape === 'axe') {
    if (pose === 'idle') {
      rect(g, 25, 8, 3, 7, color);
      rect(g, 28, 9, 3, 5, color);
    } else if (pose === 'windup') {
      rect(g, 3, 0, 3, 7, color);
      rect(g, 0, 1, 3, 5, color);
    } else {
      rect(g, 37, 20, 3, 12, color);
      rect(g, 40, 21, 3, 10, color);
    }
  } else if (pose === 'idle') {
    rect(g, 21, 9, 7, 4, color);
  } else if (pose === 'windup') {
    rect(g, 2, 0, 7, 4, color);
  } else {
    rect(g, 36, 22, 5, 9, color);
  }
}

// pose: 'idle'（構え）| 'windup'（振りかぶり）| 'hit'（叩く）
export function heroGrid(pose, tool, outfit = 'japan') {
  const o = OUTFITS[outfit] || OUTFITS.japan;
  const g = createGrid(HERO_W, HERO_H);
  // 虫かご（背中）
  rect(g, 7, 16, 4, 9, o.bag);
  line(g, 7, 16, 10, 16, 'k');
  // 脚・靴
  rect(g, 12, 32, 3, 6, o.legs);
  rect(g, 17, 32, 3, 6, o.legs);
  rect(g, 11, 38, 5, 2, 'k');
  rect(g, 16, 38, 5, 2, 'k');
  // ズボン
  rect(g, 11, 27, 10, 5, o.pants);
  // シャツ（ベストがあれば、両脇に重ねる）
  rect(g, 11, 15, 10, 12, o.shirt);
  if (o.vest) {
    rect(g, 11, 15, 3, 12, o.vest);
    rect(g, 18, 15, 3, 12, o.vest);
  }
  // 顔
  rect(g, 12, 9, 8, 6, 'f');
  put(g, 18, 11, 'k');
  line(g, 17, 13, 19, 13, 'd');
  // 帽子
  if (o.hat === 'straw') {
    ellipse(g, 16, 8.5, 9.5, 2, 't');
    ellipse(g, 16, 6.5, 5, 3.6, 't');
    line(g, 11, 7.5, 21, 7.5, 'd');
  } else if (o.hat === 'wide') {
    // つばの広い帽子（緑）
    ellipse(g, 16, 8.5, 10, 1.8, 'G');
    ellipse(g, 16, 6, 5, 3.5, 'G');
    line(g, 11, 7.5, 21, 7.5, 'k');
  } else if (o.hat === 'bandana') {
    // 赤いバンダナ
    rect(g, 11, 6, 10, 3, 'd');
    rect(g, 12, 4, 8, 2, 'd');
    put(g, 10, 8, 'd');
    put(g, 9, 9, 'd');
  } else if (o.hat === 'safari') {
    // サファリ帽（探検家スタイル）
    ellipse(g, 16, 8.5, 9.5, 2, 'h');
    ellipse(g, 16, 6, 5, 3.6, 'h');
    line(g, 11, 7.5, 21, 7.5, 'k');
  } else if (o.hat === 'rain') {
    // 雨の日の帽子（黄色いレインハット）
    ellipse(g, 16, 6, 6, 3.6, 'y');
    rect(g, 10, 8, 14, 2, 'y');
    line(g, 10, 10, 13, 10, 'y');
  } else {
    // ハンチング帽（平たい帽子）
    ellipse(g, 16, 6.5, 6, 3, 'R');
    rect(g, 12, 7, 12, 2, 'R');
    put(g, 16, 4, 'k');
  }

  // 腕
  if (pose === 'idle') {
    line(g, 19, 17, 24, 23, o.shirt, 2);
    put(g, 24, 24, 'f');
  } else if (pose === 'windup') {
    line(g, 19, 17, 14, 11, o.shirt, 2);
    put(g, 14, 10, 'f');
  } else {
    line(g, 19, 17, 28, 20, o.shirt, 2);
    put(g, 29, 20, 'f');
  }
  drawTool(g, pose, tool);
  return toRows(g);
}

// 木の色違い（ショップで買える）。variant：'autumn'（紅葉）/ 'winter'（雪をかぶった冬）/ null（基本）
const VARIANT_COLORS = {
  autumn: { G: 'd', g: 'o' },
  winter: { G: 's', g: 'w' },
  bloom: { g: 'p' },
  night: { G: 'n', g: 'G' },
};

// 夜の雨林の、ホタルの光の位置
const FIREFLIES = [[8, 8], [15, 14], [30, 10], [36, 16], [22, 20], [5, 18], [27, 5]];

export function treeGrid(kind = 'kunugi', variant = null) {
  let rows = baseTreeGrid(kind);
  // 乾季のバオバブ：葉がすべて落ちて、枝だけになる
  if (variant === 'leafless') return rows.map((row) => row.replace(/[Gg]/g, '.'));
  const map = VARIANT_COLORS[variant];
  if (map) rows = rows.map((row) => row.replace(/[Gg]/g, (c) => map[c] ?? c));
  if (variant === 'night') {
    const grid = rows.map((row) => row.split(''));
    for (const [x, y] of FIREFLIES) if (grid[y]?.[x] && grid[y][x] !== '.') grid[y][x] = 'y';
    rows = grid.map((row) => row.join(''));
  }
  return rows;
}

// 王冠（図鑑コンプリートのしるし。16×12ドット）
export function crownGrid() {
  const g = createGrid(16, 12);
  // 3つの山
  for (const x of [1, 7, 13]) {
    put(g, x + 1, 0, 'y');
    rect(g, x, 1, 3, 2, 'y');
  }
  rect(g, 1, 3, 14, 4, 'y');
  rect(g, 0, 7, 16, 4, 'y');
  rect(g, 0, 11, 16, 1, 'h');
  // 宝石
  put(g, 2, 8, 'd');
  put(g, 7, 8, 'b');
  put(g, 8, 8, 'b');
  put(g, 13, 8, 'd');
  // 縁のかげと、つや
  line(g, 1, 7, 14, 7, 'h');
  put(g, 3, 4, 'W');
  put(g, 9, 4, 'W');
  return toRows(g);
}

function baseTreeGrid(kind) {
  const g = createGrid(TREE_W, TREE_H);
  if (kind === 'ceiba') {
    // カポック（セイバ）：まっすぐな太い幹、根元の板状の根、傘のように広がる樹冠
    rect(g, 19, 20, 7, 34, 'r');
    line(g, 19, 40, 11, 55, 'r', 3);
    line(g, 26, 40, 34, 55, 'r', 3);
    rect(g, 12, 52, 21, 4, 'r');
    for (const y of [24, 30, 36, 42]) {
      put(g, 21, y, 'R');
      put(g, 23, y + 2, 'R');
    }
    rect(g, 25, 20, 1, 34, 'R');
    ellipse(g, 22, 10, 21, 7, 'G');
    ellipse(g, 11, 15, 11, 5, 'G');
    ellipse(g, 34, 15, 10, 5, 'G');
    ellipse(g, 17, 8, 10, 4, 'g');
    ellipse(g, 30, 11, 9, 4, 'g');
    ellipse(g, 8, 14, 5, 2.5, 'g');
    return toRows(g);
  }
  if (kind === 'rainforest') {
    // 熱帯雨林の巨木：高くまっすぐな幹、根元の板根、垂れ下がるつる
    rect(g, 19, 14, 6, 40, 'r');
    line(g, 19, 44, 12, 56, 'r', 3);
    line(g, 25, 44, 32, 56, 'r', 3);
    rect(g, 14, 52, 17, 4, 'r');
    for (const y of [18, 25, 32, 39, 46]) put(g, 21, y, 'R');
    rect(g, 24, 14, 1, 40, 'R');
    ellipse(g, 22, 8, 20, 8, 'G');
    ellipse(g, 9, 14, 9, 5, 'G');
    ellipse(g, 36, 14, 8, 5, 'G');
    ellipse(g, 15, 6, 9, 4, 'g');
    ellipse(g, 30, 9, 8, 4, 'g');
    // つる
    for (const x of [8, 14, 30, 35]) line(g, x, 16, x + 1, 40, 'g');
    for (const [x, y] of [[8, 30], [14, 34], [30, 28], [35, 36]]) put(g, x, y, 'G');
    return toRows(g);
  }
  if (kind === 'baobab') {
    // バオバブ：ふくらんだ瓶のような幹と、根のような枝
    ellipse(g, 22, 44, 11, 10, 'r');
    rect(g, 12, 30, 20, 16, 'r');
    rect(g, 15, 22, 14, 10, 'r');
    for (const y of [26, 33, 40, 48]) line(g, 14, y, 17, y + 4, 'R');
    for (const y of [24, 31, 38, 46]) line(g, 28, y, 30, y + 5, 'R');
    rect(g, 31, 30, 1, 16, 'R');
    // 枝
    line(g, 18, 22, 8, 11, 'r', 3);
    line(g, 26, 22, 36, 9, 'r', 3);
    line(g, 22, 22, 22, 6, 'r', 3);
    line(g, 12, 15, 5, 15, 'r', 2);
    line(g, 32, 14, 40, 15, 'r', 2);
    // 小さな樹冠
    ellipse(g, 7, 10, 6, 4, 'G');
    ellipse(g, 37, 8, 7, 4, 'G');
    ellipse(g, 22, 5, 7, 3.5, 'G');
    ellipse(g, 5, 15, 4, 2.5, 'G');
    ellipse(g, 40, 14, 4, 2.5, 'G');
    ellipse(g, 6, 9, 3, 2, 'g');
    ellipse(g, 36, 7, 4, 2, 'g');
    ellipse(g, 21, 4, 4, 1.8, 'g');
    return toRows(g);
  }
  if (kind === 'oak') {
    // 太い幹
    rect(g, 16, 22, 12, 34, 'r');
    rect(g, 12, 50, 20, 6, 'r');
    for (const y of [26, 33, 41, 48]) line(g, 18, y, 20, y + 4, 'R');
    for (const y of [24, 30, 38, 46]) line(g, 24, y, 25, y + 4, 'R');
    rect(g, 27, 22, 1, 34, 'R');
    rect(g, 20, 36, 3, 3, 'R'); // 幹のこぶ
    line(g, 16, 27, 5, 21, 'r', 3);
    line(g, 28, 27, 39, 20, 'r', 3);
    // 広く茂る葉
    ellipse(g, 22, 13, 21, 12, 'G');
    ellipse(g, 10, 21, 10, 8, 'G');
    ellipse(g, 34, 20, 10, 8, 'G');
    ellipse(g, 16, 9, 9, 5, 'g');
    ellipse(g, 30, 12, 9, 5, 'g');
    ellipse(g, 8, 19, 5, 3, 'g');
    // どんぐり
    for (const [x, y] of [[14, 17], [26, 20], [31, 12], [19, 22], [7, 22], [37, 19], [22, 8]]) {
      put(g, x, y, 'r');
      put(g, x, y + 1, 'R');
    }
    return toRows(g);
  }
  // クヌギ
  rect(g, 18, 22, 9, 34, 'r');
  rect(g, 15, 50, 15, 6, 'r');
  for (const y of [26, 33, 41, 48]) line(g, 19, y, 21, y + 3, 'R');
  for (const y of [24, 30, 38, 46]) line(g, 24, y, 25, y + 4, 'R');
  rect(g, 26, 22, 1, 34, 'R');
  // 樹液の跡
  rect(g, 20, 36, 3, 4, 'y');
  put(g, 21, 41, 'y');
  line(g, 18, 26, 8, 20, 'r', 2);
  line(g, 27, 26, 37, 19, 'r', 2);
  ellipse(g, 22, 12, 21, 11, 'G');
  ellipse(g, 11, 19, 11, 8, 'G');
  ellipse(g, 33, 18, 11, 8, 'G');
  ellipse(g, 17, 9, 10, 5, 'g');
  ellipse(g, 30, 13, 9, 4.5, 'g');
  ellipse(g, 9, 17, 6, 3.5, 'g');
  ellipse(g, 36, 17, 5, 3, 'g');
  return toRows(g);
}
