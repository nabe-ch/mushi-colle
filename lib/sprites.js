// 主人公（虫を採集する人）と木（クヌギ）のドット絵。pixel.js の道具でその場で組み立てる。
// 地域の格好は「その地域を訪れる採集者らしい服装」（企画書、2026-09-25決定。伝統衣装は使わない）
import { createGrid, put, rect, ellipse, line, toRows } from './pixel';

export const HERO_W = 46;
export const HERO_H = 40;
export const TREE_W = 44;
export const TREE_H = 58;

// pose: 'idle'（構え）| 'windup'（振りかぶり）| 'hit'（叩く）
export function heroGrid(pose, hammerColor = 'r') {
  const g = createGrid(HERO_W, HERO_H);
  // 虫かご（背中）
  rect(g, 7, 16, 4, 9, 'g');
  line(g, 7, 16, 10, 16, 'G');
  // 脚・靴
  rect(g, 12, 32, 3, 6, 'f');
  rect(g, 17, 32, 3, 6, 'f');
  rect(g, 11, 38, 5, 2, 'k');
  rect(g, 16, 38, 5, 2, 'k');
  // 半ズボン
  rect(g, 11, 27, 10, 5, 'b');
  // 服（白いシャツ）
  rect(g, 11, 15, 10, 12, 'w');
  // 顔
  rect(g, 12, 9, 8, 6, 'f');
  put(g, 18, 11, 'k');
  line(g, 17, 13, 19, 13, 'd');
  // 麦わら帽子
  ellipse(g, 16, 8.5, 9.5, 2, 't');
  ellipse(g, 16, 6.5, 5, 3.6, 't');
  line(g, 11, 7.5, 21, 7.5, 'd');

  // 腕とハンマー
  if (pose === 'idle') {
    line(g, 19, 17, 24, 23, 'w', 2);
    put(g, 24, 24, 'f');
    line(g, 24, 24, 24, 12, 'R', 2);
    rect(g, 21, 9, 7, 4, hammerColor);
  } else if (pose === 'windup') {
    line(g, 19, 17, 14, 11, 'w', 2);
    put(g, 14, 10, 'f');
    line(g, 14, 10, 6, 2, 'R', 2);
    rect(g, 2, 0, 7, 4, hammerColor);
  } else {
    line(g, 19, 17, 28, 20, 'w', 2);
    put(g, 29, 20, 'f');
    line(g, 29, 20, 37, 26, 'R', 2);
    rect(g, 36, 22, 5, 9, hammerColor);
  }
  return toRows(g);
}

// クヌギ（樹液が出る木）。幹に樹液の跡がある
export function treeGrid() {
  const g = createGrid(TREE_W, TREE_H);
  // 幹
  rect(g, 18, 22, 9, 34, 'r');
  rect(g, 15, 50, 15, 6, 'r');
  for (const y of [26, 33, 41, 48]) line(g, 19, y, 21, y + 3, 'R');
  for (const y of [24, 30, 38, 46]) line(g, 24, y, 25, y + 4, 'R');
  rect(g, 26, 22, 1, 34, 'R');
  // 樹液の跡
  rect(g, 20, 36, 3, 4, 'y');
  put(g, 21, 41, 'y');
  // 枝
  line(g, 18, 26, 8, 20, 'r', 2);
  line(g, 27, 26, 37, 19, 'r', 2);
  // 葉（濃い緑→明るい緑）
  ellipse(g, 22, 12, 21, 11, 'G');
  ellipse(g, 11, 19, 11, 8, 'G');
  ellipse(g, 33, 18, 11, 8, 'G');
  ellipse(g, 17, 9, 10, 5, 'g');
  ellipse(g, 30, 13, 9, 4.5, 'g');
  ellipse(g, 9, 17, 6, 3.5, 'g');
  ellipse(g, 36, 17, 5, 3, 'g');
  return toRows(g);
}
