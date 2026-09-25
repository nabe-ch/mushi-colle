// 南米・東南アジア・アフリカの虫のドット絵（32×32）。pixel.js の道具でその場で組み立てる
import { createGrid, put, rect, ellipse, line, mirrorX, toRows } from './pixel';

const SIZE = 32;

// 左半分だけ描いて、左右に反転して合成する
function symmetric(drawLeft) {
  const left = createGrid(SIZE, SIZE);
  drawLeft(left);
  const right = mirrorX(left);
  const out = createGrid(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) out[y][x] = left[y][x] !== '.' ? left[y][x] : right[y][x];
  return out;
}

// カブトムシ系（横から見た姿。頭が右）。horns で、角の形を描く。thorax は胸の色（省略時は body）
function rhinoSide({ body, edge, thorax = body, horns }) {
  const g = createGrid(SIZE, SIZE);
  line(g, 9, 26, 5, 31, edge, 2);
  line(g, 15, 27, 14, 31, edge, 2);
  line(g, 21, 26, 24, 31, edge, 2);
  ellipse(g, 12, 20, 11, 8.5, edge);
  ellipse(g, 12, 20, 9.6, 7.2, body);
  ellipse(g, 23, 20, 5.5, 5.5, edge);
  ellipse(g, 23, 20, 4.2, 4.2, thorax);
  ellipse(g, 28, 22, 3, 3, edge);
  horns(g);
  put(g, 29, 22, 'W');
  put(g, 7, 15, 'W');
  put(g, 8, 15, 'W');
  put(g, 6, 16, 'W');
  for (let x = 4; x <= 20; x++) put(g, x, 20, edge);
  return toRows(g);
}

// ---------------- 南米 ----------------

// ハキリアリ：切り取った葉を頭の上にかざして運ぶ
export function leafcutterAnt() {
  const g = symmetric((h) => {
    line(h, 14, 15, 7, 12, 'R');
    line(h, 14, 17, 6, 18, 'R');
    line(h, 14, 19, 8, 26, 'R');
    ellipse(h, 15.5, 25, 4.2, 5.5, 'R');
    ellipse(h, 15.5, 25, 3.2, 4.5, 'B');
    ellipse(h, 15.5, 17.5, 2.6, 3.4, 'B');
    ellipse(h, 15.5, 12, 3.6, 3.2, 'B');
    put(h, 13, 11, 'W');
    line(h, 14, 10, 11, 7, 'R');
  });
  // 葉（頭の上にかざす）
  ellipse(g, 15.5, 4, 10, 3.6, 'G');
  ellipse(g, 15.5, 4, 8.6, 2.4, 'g');
  line(g, 6, 4, 25, 4, 'G');
  put(g, 14, 8, 'R');
  put(g, 17, 8, 'R');
  return toRows(g);
}

// モルフォチョウ：青く光るはね
export function morphoButterfly() {
  const g = symmetric((h) => {
    // 後ろのはね
    ellipse(h, 10, 22, 7.5, 6.5, 'n');
    ellipse(h, 10, 22, 6.3, 5.3, 'b');
    ellipse(h, 9, 22, 3.5, 2.5, 'l');
    // 前のはね
    ellipse(h, 9, 10.5, 9, 7.5, 'n');
    ellipse(h, 9, 10.5, 7.7, 6.2, 'b');
    ellipse(h, 8, 10, 5, 3.2, 'l');
    // ふちの白い点
    for (const [x, y] of [[2, 8], [2, 12], [4, 15], [5, 27], [9, 28]]) put(h, x, y, 'W');
    line(h, 15, 8, 12, 2, 'k');
  });
  rect(g, 15, 7, 2, 17, 'R');
  rect(g, 15, 5, 2, 3, 'R');
  return toRows(g);
}

// アクティオンゾウカブト：真っ黒で、太い角が平行に伸びる
export function actaeonBeetle() {
  return rhinoSide({
    body: 'n',
    edge: 'e',
    horns: (g) => {
      line(g, 28, 20, 31, 10, 'e', 3);
      line(g, 24, 16, 28, 7, 'e', 3);
    },
  });
}

// ヘラクレスオオカブト：黄土色のはね、黒い胸、世界最長クラスの角
export function herculesBeetle() {
  return rhinoSide({
    body: 'y',
    edge: 'n',
    thorax: 'n',
    horns: (g) => {
      // 頭の角（上向きに長く伸びて、先が内側に曲がる）
      line(g, 28, 20, 31, 12, 'n', 3);
      line(g, 31, 12, 29, 4, 'n', 3);
      line(g, 29, 4, 26, 1, 'n', 2);
      // 胸の角（前向きに伸びて、頭の角と向かい合う）
      line(g, 24, 16, 23, 9, 'n', 3);
      line(g, 23, 9, 26, 3, 'n', 2);
      // 胸の角の下の、黄色いブラシ状の毛
      for (const [x, y] of [[25, 12], [26, 13], [25, 14], [26, 11]]) put(g, x, y, 'y');
    },
  });
}

// 架空：ハンモックで昼寝をする虫
export function hammockBug() {
  const g = createGrid(SIZE, SIZE);
  // 2本の木
  rect(g, 1, 6, 3, 25, 'R');
  rect(g, 28, 6, 3, 25, 'R');
  put(g, 0, 6, 'g');
  put(g, 4, 5, 'g');
  put(g, 27, 5, 'g');
  // ハンモック（たるんだ布）
  for (let x = 4; x <= 27; x++) {
    const sag = Math.round(8 * Math.sin(((x - 4) / 23) * Math.PI));
    put(g, x, 12 + sag, 'p');
    put(g, x, 13 + sag, 'p');
    put(g, x, 14 + sag, 'd');
  }
  // 虫（丸い体、閉じた目、ナイトキャップ）
  ellipse(g, 16, 17, 6, 4.5, 'g');
  ellipse(g, 16, 17, 4.8, 3.4, 'g');
  line(g, 13, 16, 14, 16, 'k');
  line(g, 17, 16, 18, 16, 'k');
  put(g, 15, 18, 'd');
  ellipse(g, 21, 15, 3, 2, 'd');
  put(g, 24, 15, 'W');
  // 眠りのしるし
  put(g, 23, 8, 'W');
  put(g, 24, 8, 'W');
  put(g, 24, 9, 'W');
  put(g, 23, 10, 'W');
  put(g, 24, 10, 'W');
  return toRows(g);
}

// ---------------- 東南アジア ----------------

// ツムギアリ：左右の葉を、糸でぬい合わせる
export function weaverAnt() {
  const g = symmetric((h) => {
    line(h, 14, 14, 7, 9, 'R');
    line(h, 14, 17, 5, 17, 'R');
    line(h, 14, 20, 7, 26, 'R');
    ellipse(h, 15.5, 25, 3.8, 5.2, 'R');
    ellipse(h, 15.5, 25, 2.8, 4.2, 't');
    ellipse(h, 15.5, 17.5, 2.2, 4, 't');
    ellipse(h, 15.5, 10.5, 3, 3, 't');
    put(h, 13, 10, 'k');
    line(h, 14, 8, 11, 4, 'R');
    // 葉
    ellipse(h, 2.5, 15, 3.2, 9, 'G');
    ellipse(h, 2.5, 15, 2.2, 8, 'g');
    // 糸
    for (const [x, y] of [[6, 10], [7, 12], [6, 14], [7, 16], [6, 18]]) put(h, x, y, 'w');
  });
  return toRows(g);
}

// ハナカマキリ：ランの花びらのような、白とピンクの体
export function orchidMantis() {
  const g = symmetric((h) => {
    // 花びら状の脚
    ellipse(h, 8, 18, 4.2, 3, 'p');
    ellipse(h, 8, 18, 3, 2, 'w');
    ellipse(h, 7, 24, 4, 2.8, 'p');
    ellipse(h, 7, 24, 2.8, 1.8, 'w');
    ellipse(h, 11, 29, 3.4, 2, 'p');
    // かまのような前脚
    line(h, 13, 11, 7, 8, 'w', 2);
    line(h, 7, 8, 8, 4, 'p', 2);
    // 体
    ellipse(h, 15.5, 21, 2.8, 8.5, 'w');
    ellipse(h, 15.5, 12, 2.4, 3, 'w');
    ellipse(h, 15.5, 7, 3.4, 2.6, 'w');
    put(h, 13, 6, 'g');
    put(h, 13, 7, 'k');
    put(h, 15, 4, 'p');
  });
  for (let y = 15; y < 28; y += 3) {
    put(g, 15, y, 'p');
    put(g, 16, y, 'p');
  }
  return toRows(g);
}

// アトラスオオカブト：胸に前へ伸びる2本の角、頭に短い角
export function atlasBeetle() {
  return rhinoSide({
    body: 'r',
    edge: 'n',
    horns: (g) => {
      line(g, 28, 20, 30, 13, 'n', 3);
      line(g, 24, 15, 31, 11, 'n', 2);
      line(g, 25, 18, 31, 17, 'n', 2);
    },
  });
}

// ギラファノコギリクワガタ：体に比べて、大あごがとても長い
export function giraffeStag() {
  const g = symmetric((h) => {
    line(h, 11, 16, 4, 15, 'n', 2);
    line(h, 11, 20, 4, 24, 'n', 2);
    line(h, 12, 24, 6, 30, 'n', 2);
    ellipse(h, 15.5, 23.5, 6.2, 7.5, 'n');
    ellipse(h, 15.5, 23.5, 5, 6.3, 'R');
    ellipse(h, 15.5, 15.5, 5.2, 2.8, 'n');
    ellipse(h, 15.5, 15.5, 4, 1.8, 'R');
    ellipse(h, 15.5, 11.5, 4.2, 2.2, 'n');
    put(h, 13, 11, 'W');
    // とても長い大あご
    const jaw = [[12, 10], [8, 7], [5, 3], [7, 0]];
    for (let i = 0; i < jaw.length - 1; i++) line(h, jaw[i][0], jaw[i][1], jaw[i + 1][0], jaw[i + 1][1], 'n', 2);
    put(h, 9, 5, 'n');
    put(h, 10, 8, 'n');
    put(h, 8, 1, 'n');
    put(h, 10, 20, 'W');
    put(h, 10, 21, 'W');
  });
  for (let y = 16; y < 30; y++) {
    g[y][15] = 'n';
    g[y][16] = 'n';
  }
  return toRows(g);
}

// 架空：マイクを握って歌う虫
export function karaokeBug() {
  const g = symmetric((h) => {
    line(h, 11, 25, 6, 28, 'k');
    line(h, 12, 28, 10, 31, 'k');
    ellipse(h, 15.5, 22, 7.5, 6.5, 'm');
    ellipse(h, 15.5, 22, 6.3, 5.3, 'v');
    ellipse(h, 15.5, 13, 6, 5, 'v');
    ellipse(h, 15.5, 13, 4.8, 4, 'f');
    // ほほ
    put(h, 12, 15, 'p');
    put(h, 13, 15, 'p');
  });
  // 楽しそうに閉じた目（^ ^）
  put(g, 12, 11, 'k');
  put(g, 13, 10, 'k');
  put(g, 14, 11, 'k');
  put(g, 17, 11, 'k');
  put(g, 18, 10, 'k');
  put(g, 19, 11, 'k');
  // 大きく開けた口
  rect(g, 15, 15, 2, 2, 'd');
  // マイク
  line(g, 22, 22, 25, 17, 's', 2);
  ellipse(g, 26, 15, 2.3, 2.3, 'k');
  // 音符
  for (const [x, y] of [[5, 4], [5, 5], [5, 6], [6, 3], [7, 3], [28, 5], [28, 6], [28, 7], [29, 4], [30, 4]]) put(g, x, y, 'y');
  return toRows(g);
}

// ---------------- アフリカ ----------------

// ヒジリタマオシコガネ：ふんの玉を転がす
export function scarabBeetle() {
  const g = createGrid(SIZE, SIZE);
  // ふんの玉
  ellipse(g, 16, 23, 8.5, 7.5, 'R');
  ellipse(g, 16, 23, 7.3, 6.3, 'r');
  for (const [x, y] of [[12, 20], [14, 26], [19, 21], [21, 25], [16, 18]]) put(g, x, y, 'R');
  // 虫（玉を後ろ脚で押す）
  line(g, 11, 12, 6, 16, 'n', 2);
  line(g, 21, 12, 26, 16, 'n', 2);
  line(g, 12, 8, 7, 6, 'n');
  line(g, 20, 8, 25, 6, 'n');
  line(g, 13, 14, 10, 18, 'n', 2);
  line(g, 19, 14, 22, 18, 'n', 2);
  ellipse(g, 16, 10, 5.5, 5.5, 'n');
  ellipse(g, 16, 10, 4.4, 4.4, 'e');
  ellipse(g, 16, 4.2, 3.4, 2, 'n');
  // ギザギザの頭
  for (const x of [13, 15, 17, 19]) put(g, x, 2, 'n');
  put(g, 14, 9, 'W');
  put(g, 14, 10, 'W');
  for (let y = 6; y < 15; y++) g[y][16] = 'n';
  return toRows(g);
}

// サバクトビバッタ：黄色い群生相。大きな後ろ脚
export function desertLocust() {
  const g = createGrid(SIZE, SIZE);
  // 後ろ脚（太ももが大きい）
  line(g, 9, 19, 4, 27, 'h', 3);
  line(g, 4, 27, 2, 31, 'R', 2);
  // 中・前脚
  line(g, 17, 21, 16, 28, 'R', 2);
  line(g, 23, 21, 25, 28, 'R', 2);
  // 体（黄色）
  ellipse(g, 14, 17, 12, 4.6, 'h');
  ellipse(g, 14, 17, 11, 3.6, 'y');
  // はね
  ellipse(g, 12, 14.5, 10, 2.2, 'h');
  // 頭
  ellipse(g, 26.5, 17, 4.2, 3.6, 'h');
  ellipse(g, 26.5, 17, 3.2, 2.8, 'y');
  put(g, 28, 16, 'k');
  put(g, 28, 15, 'k');
  line(g, 28, 13, 31, 7, 'k');
  // 黒い斑点
  for (const [x, y] of [[8, 17], [12, 19], [16, 17], [20, 19], [10, 15], [17, 14]]) put(g, x, y, 'k');
  return toRows(g);
}

// マダガスカルゴキブリ：はねがなく、つやのある楕円の体。「シュー」の音
export function hissingRoach() {
  const g = symmetric((h) => {
    line(h, 12, 13, 5, 10, 'R', 2);
    line(h, 11, 18, 3, 19, 'R', 2);
    line(h, 12, 23, 5, 28, 'R', 2);
    ellipse(h, 15.5, 20, 8, 10, 'R');
    ellipse(h, 15.5, 20, 6.8, 8.8, 'o');
    // 前胸のたて（黄土色）
    ellipse(h, 15.5, 9.5, 6.4, 3.5, 'R');
    ellipse(h, 15.5, 9.5, 5.2, 2.5, 'h');
    ellipse(h, 15.5, 5.5, 2.8, 2, 'R');
    put(h, 13, 5, 'W');
    // 長い触角
    line(h, 14, 4, 10, 1, 'R');
    line(h, 10, 1, 7, 0, 'R');
    // つや
    put(h, 11, 16, 'W');
    put(h, 11, 17, 'W');
    // 体の節
    for (const y of [17, 20, 23, 26]) line(h, 10, y, 14, y, 'R');
  });
  // 「シュー」の空気
  for (const [x, y] of [[27, 27], [28, 26], [29, 27], [28, 29], [30, 28]]) put(g, x, y, 's');
  return toRows(g);
}

// ゴライアスオオツノハナムグリ：白地に黒のしま模様の胸、二又の角
export function goliathBeetle() {
  const g = symmetric((h) => {
    line(h, 11, 12, 5, 10, 'n', 2);
    line(h, 10, 18, 3, 18, 'n', 2);
    line(h, 11, 24, 5, 28, 'n', 2);
    ellipse(h, 15.5, 22, 8.5, 9, 'n');
    ellipse(h, 15.5, 22, 7.3, 7.8, 'h');
    // はねの白い模様
    ellipse(h, 12, 19, 3, 5, 'w');
    ellipse(h, 12, 27, 2.5, 2, 'w');
    // 胸（白地に黒いしま）
    ellipse(h, 15.5, 11.5, 7, 4.2, 'n');
    ellipse(h, 15.5, 11.5, 6, 3.3, 'w');
    for (const x of [10, 13]) line(h, x, 9, x, 14, 'k');
    // 頭と二又の角
    rect(h, 12, 5, 4, 3, 'n');
    line(h, 14, 5, 12, 1, 'n');
    put(h, 15, 2, 'n');
    put(h, 15, 3, 'n');
    put(h, 15, 4, 'n');
  });
  g[2][16] = 'n';
  g[3][16] = 'n';
  g[4][16] = 'n';
  for (let y = 13; y < 30; y++) {
    g[y][15] = 'n';
    g[y][16] = 'n';
  }
  return toRows(g);
}

// 架空：バオバブの木そっくりの体で、お腹に水をためる虫
export function baobabBug() {
  const g = symmetric((h) => {
    line(h, 11, 26, 8, 31, 'k', 2);
    line(h, 12, 28, 11, 31, 'k', 2);
    // 太い、ふくらんだ胴（バオバブの幹）
    ellipse(h, 15.5, 21, 8.5, 9, 'R');
    ellipse(h, 15.5, 21, 7.3, 7.8, 'r');
    rect(h, 11, 8, 5, 8, 'R');
    rect(h, 12, 8, 4, 8, 'r');
    // 顔
    put(h, 13, 19, 'k');
    put(h, 13, 20, 'k');
    line(h, 14, 23, 15, 23, 'd');
    // 木の年輪のような筋
    for (const y of [14, 17]) line(h, 9, y, 11, y, 'R');
  });
  // 頭の上の葉と枝
  for (const [x, y, w] of [[8, 3, 6], [13, 1, 7], [17, 3, 6]]) rect(g, x, y, w, 2, 'g');
  line(g, 16, 8, 11, 5, 'r', 2);
  line(g, 16, 8, 21, 5, 'r', 2);
  line(g, 16, 8, 16, 3, 'r', 2);
  // お腹の水（水色）
  ellipse(g, 16, 25, 3.5, 2.2, 'l');
  put(g, 15, 24, 'W');
  return toRows(g);
}
