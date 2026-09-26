// 月の虫3種（すべて架空のユニーク）のドット絵（32×32）。ユーザー指定（2026-09-26）：「月の行先。3種、ユニークかつおもしろい虫」
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

// モチツキムシ：うさぎの耳と、餅つきの杵
export function mochiBug() {
  const g = symmetric((h) => {
    // 耳
    ellipse(h, 12, 5, 2, 5.4, 'w');
    ellipse(h, 12, 6, 0.9, 3.2, 'p');
    // 体と頭
    ellipse(h, 15.5, 21, 7.4, 6.4, 'w');
    ellipse(h, 15.5, 13, 5.4, 4.8, 'w');
    line(h, 9, 26, 22, 26, 's');
    put(h, 13, 12, 'k');
    put(h, 13, 11, 'k');
    put(h, 15, 15, 'p');
    put(h, 12, 15, 'p');
    put(h, 11, 21, 's');
    put(h, 10, 23, 's');
    // 足
    ellipse(h, 11, 28, 2.6, 1.4, 'w');
  });
  // 杵と、ついた餅（右側）
  line(g, 23, 22, 28, 12, 'R', 2);
  rect(g, 25, 8, 6, 5, 'r');
  rect(g, 25, 8, 6, 1, 'h');
  ellipse(g, 26, 28, 4.5, 2.4, 'W');
  put(g, 24, 27, 's');
  return toRows(g);
}

// ムーンウォークムシ：サングラスをかけて、後ろ向きにすべる
export function moonwalkBug() {
  const g = symmetric((h) => {
    // 脚（すべる向きに、そろえて斜めに）
    line(h, 11, 15, 5, 19, 'k');
    line(h, 11, 18, 4, 23, 'k');
    line(h, 12, 21, 7, 28, 'k');
    // 体
    ellipse(h, 15.5, 19, 5.8, 8, 'm');
    ellipse(h, 15.5, 19, 4.4, 6.6, 'v');
    rect(h, 15, 13, 2, 13, 'm');
    ellipse(h, 15.5, 8.5, 4.6, 3.8, 'm');
    // サングラス
    rect(h, 11, 7, 5, 3, 'k');
    put(h, 12, 7, 'W');
    // 触角
    line(h, 13, 5, 10, 1, 'k');
    // 白い手袋
    ellipse(h, 6, 17, 1.6, 1.6, 'W');
  });
  // 動いた跡と、きらきら
  line(g, 2, 30, 12, 30, 's');
  line(g, 4, 28, 10, 28, 'e');
  for (const [x, y] of [[26, 6], [29, 12], [24, 26], [28, 22]]) put(g, x, y, 'y');
  return toRows(g);
}

// ツキミダンゴムシ：お月見団子にそっくり。ススキと三方つき
export function tsukimiDango() {
  const g = createGrid(SIZE, SIZE);
  // ススキ
  line(g, 4, 26, 3, 10, 't');
  line(g, 3, 10, 6, 6, 'y');
  line(g, 3, 12, 1, 8, 'y');
  line(g, 28, 26, 29, 8, 't');
  line(g, 29, 8, 26, 4, 'y');
  line(g, 29, 10, 31, 6, 'y');
  // 三方（台）
  rect(g, 8, 25, 16, 2, 'r');
  rect(g, 6, 27, 20, 2, 'R');
  // 団子のような体
  ellipse(g, 15.5, 16, 9, 8.6, 'w');
  ellipse(g, 15.5, 16, 9, 8.6, 'w');
  for (const y of [11, 15, 19]) line(g, 8 + Math.abs(y - 15) / 2, y, 23 - Math.abs(y - 15) / 2, y, 's');
  // つや
  put(g, 11, 10, 'W');
  put(g, 12, 9, 'W');
  // 顔（すまし顔）
  put(g, 12, 16, 'k');
  put(g, 19, 16, 'k');
  line(g, 14, 19, 17, 19, 'd');
  put(g, 10, 18, 'p');
  put(g, 21, 18, 'p');
  // 触角
  line(g, 13, 7, 11, 3, 'k');
  line(g, 18, 7, 20, 3, 'k');
  return toRows(g);
}
