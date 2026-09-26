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

// ワープムシ：光の輪（ワープゲート）から、ひょっこり出てきた虫
export function warpBug() {
  const g = createGrid(SIZE, SIZE);
  ellipse(g, 15.5, 16, 14, 14, 'v');
  ellipse(g, 15.5, 16, 11.6, 11.6, 'b');
  ellipse(g, 15.5, 16, 9.4, 9.4, 'l');
  ellipse(g, 15.5, 16, 7.6, 7.6, 'n');
  // ゲートのきらめき
  for (const [x, y] of [[4, 8], [27, 9], [3, 22], [28, 24], [15, 1], [16, 30]]) put(g, x, y, 'W');
  // 虫（黄色い体）
  ellipse(g, 15.5, 18, 3.6, 5, 'y');
  line(g, 15, 14, 15, 22, 'h');
  ellipse(g, 15.5, 12, 2.6, 2.2, 'y');
  put(g, 14, 11, 'k');
  put(g, 17, 11, 'k');
  line(g, 14, 9, 12, 7, 'W');
  line(g, 17, 9, 19, 7, 'W');
  line(g, 12, 16, 9, 15, 'W');
  line(g, 19, 16, 22, 15, 'W');
  line(g, 12, 20, 9, 22, 'W');
  line(g, 19, 20, 22, 22, 'W');
  return toRows(g);
}

// ロケットムシ：ロケットそのものの体。赤い先端と、噴き出す炎
export function rocketBug() {
  const g = symmetric((h) => {
    // 先端（赤）
    for (let y = 2; y <= 8; y++) {
      const half = Math.round(1 + (y - 2) * 0.7);
      rect(h, 16 - half, y, half, 1, 'X');
    }
    line(h, 14, 2, 12, 0, 'k');
    // 胴
    ellipse(h, 15.5, 16, 5.4, 8.6, 'w');
    rect(h, 10, 9, 6, 1, 'X');
    line(h, 11, 22, 15, 22, 's');
    // 窓（虫の目）
    ellipse(h, 15.5, 14, 3, 3, 's');
    ellipse(h, 15.5, 14, 2.2, 2.2, 'b');
    put(h, 14, 13, 'W');
    // 羽根
    line(h, 10, 19, 6, 26, 'X', 2);
    rect(h, 9, 22, 2, 3, 'X');
    // ノズルと炎
    rect(h, 13, 24, 3, 2, 'e');
    ellipse(h, 15.5, 28, 3.2, 3, 'o');
    ellipse(h, 15.5, 28, 1.8, 2.2, 'y');
    put(h, 15, 31, 'o');
    // 小さな足
    line(h, 10, 17, 7, 19, 'k');
  });
  return toRows(g);
}

// 地球（月のショップの特別商品）。mood：'ribbon'（リボンつきで、お買い上げ）/ 'smug'（サングラスのドヤ顔）/ 'tongue'（あっかんべー）
export function earthGrid(mood) {
  const g = createGrid(SIZE, SIZE);
  ellipse(g, 15.5, 15.5, 14, 14, 'b');
  ellipse(g, 15.5, 15.5, 14, 14, 'b');
  // 大陸
  ellipse(g, 9, 9, 4.6, 3.6, 'g');
  ellipse(g, 12, 13, 2.4, 3, 'g');
  ellipse(g, 22, 8, 4.4, 2.4, 'g');
  ellipse(g, 24, 15, 2.6, 3.4, 'g');
  ellipse(g, 20, 24, 4, 2.4, 'g');
  ellipse(g, 6, 20, 2.4, 2, 'g');
  // 雲とつや
  for (const [x, y, w] of [[6, 5, 4], [17, 4, 5], [21, 19, 4], [8, 25, 4]]) rect(g, x, y, w, 1, 'W');
  line(g, 4, 12, 4, 17, 'l');
  put(g, 6, 6, 'W');
  // 影（右下）
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (g[y][x] === '.') continue;
      const d = (x - 15.5) + (y - 15.5);
      if (d > 14) g[y][x] = g[y][x] === 'g' ? 'G' : 'm';
    }
  }
  if (mood === 'ribbon') {
    // 顔（にっこり）と、赤いリボン
    put(g, 12, 15, 'k');
    put(g, 19, 15, 'k');
    line(g, 13, 19, 18, 19, 'k');
    put(g, 12, 18, 'k');
    put(g, 19, 18, 'k');
    rect(g, 3, 20, 26, 2, 'X');
    rect(g, 14, 2, 4, 3, 'X');
    ellipse(g, 11, 3, 3, 2, 'X');
    ellipse(g, 21, 3, 3, 2, 'X');
  } else if (mood === 'smug') {
    // サングラスと、ニヤリ
    rect(g, 8, 13, 7, 3, 'k');
    rect(g, 17, 13, 7, 3, 'k');
    rect(g, 15, 13, 2, 1, 'k');
    put(g, 9, 13, 'W');
    put(g, 18, 13, 'W');
    line(g, 12, 20, 20, 20, 'k');
    put(g, 21, 19, 'k');
    put(g, 22, 18, 'k');
  } else {
    // ウインクと、あっかんべー
    line(g, 9, 14, 13, 14, 'k');
    put(g, 19, 14, 'k');
    put(g, 20, 14, 'k');
    line(g, 12, 19, 20, 19, 'k');
    rect(g, 17, 20, 4, 4, 'X');
    put(g, 19, 22, 'd');
  }
  return toRows(g);
}
