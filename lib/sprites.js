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

// 木。kind：'kunugi'（クヌギ。樹液の跡がある）/ 'oak'（ヨーロッパのオーク。どんぐりがなる、太い幹）
export function treeGrid(kind = 'kunugi') {
  const g = createGrid(TREE_W, TREE_H);
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
