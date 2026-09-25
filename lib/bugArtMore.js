// 最終形（各地域で実在12種＋ユニーク3種）のための、追加の虫のドット絵（32×32）。
// チョウ・ガ・ハチ・セミ・カマキリ・トンボなどの共通の型（テンプレート）を作り、色や模様を変えて描き分ける
import { createGrid, put, rect, ellipse, line, mirrorX, toRows } from './pixel';
import { stagBeetle, rhinoSide } from './bugArtWorld';

const SIZE = 32;

function symmetric(drawLeft) {
  const left = createGrid(SIZE, SIZE);
  drawLeft(left);
  const right = mirrorX(left);
  const out = createGrid(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) out[y][x] = left[y][x] !== '.' ? left[y][x] : right[y][x];
  return out;
}

function eyeSpot(h, x, y, r, ring, dot) {
  ellipse(h, x, y, r, r, ring);
  ellipse(h, x, y, r * 0.62, r * 0.62, 'k');
  if (dot) put(h, x - 1, y - 1, dot);
}

// ---------------- チョウ・ガ ----------------
// main：はねの色、edge：ふち、accent：内側の模様、spots：ふちの点、eye：目玉模様、tail：後ろばねの尾、narrow：細長いはね、moth：ガ（太い胴・羽毛の触角）
function butterfly({ main, edge = 'k', accent = null, spots = null, eye = null, owl = false, tail = false, narrow = false, moth = false, wide = false }) {
  const g = symmetric((h) => {
    const hr = narrow ? 5 : 6.5;
    ellipse(h, 10, 22, wide ? 8 : 7.5, hr, edge);
    ellipse(h, 10, 22, wide ? 6.9 : 6.4, hr - 1.2, main);
    if (tail) {
      line(h, 8, 27, 6, 31, edge, 2);
    }
    const fw = narrow ? 10 : wide ? 9.5 : 9;
    const fh = narrow ? 5.6 : 7.4;
    ellipse(h, 9, 10.5, fw, fh, edge);
    ellipse(h, 9, 10.5, fw - 1.3, fh - 1.3, main);
    if (accent) {
      ellipse(h, 8, 10, 4.6, 2.8, accent);
      ellipse(h, 10, 22, 3.2, 2.5, accent);
    }
    if (spots) for (const [x, y] of [[3, 8], [3, 12], [5, 15], [5, 27], [8, 28], [13, 26]]) put(h, x, y, spots);
    if (eye) {
      eyeSpot(h, 7, 9, 3.4, eye.ring, 'W');
      eyeSpot(h, 9, 22, 3, eye.ring, 'W');
    }
    if (owl) {
      eyeSpot(h, 10, 22, 5, 'y', 'W');
      eyeSpot(h, 8, 9, 2.4, 'y', 'W');
    }
    if (moth) {
      line(h, 14, 8, 10, 3, 'k');
      put(h, 12, 4, 'k');
      put(h, 11, 5, 'k');
      put(h, 10, 6, 'k');
      put(h, 12, 6, 'k');
    } else {
      line(h, 15, 8, 12, 2, 'k');
    }
  });
  rect(g, 15, 7, 2, 17, 'R');
  rect(g, 15, 5, 2, 3, 'R');
  if (moth) {
    rect(g, 14, 9, 4, 9, 'R');
  }
  return toRows(g);
}

// ---------------- ハチ・テントウムシ・ハエ ----------------
// base：体の色、stripe：しま、size：体の大きさ（1が標準）
function bee({ base = 'n', stripe = 'y', wing = 'l', big = false }) {
  const ry = big ? 9 : 7.5;
  const g = symmetric((h) => {
    ellipse(h, 8, 14, 6.5, 3, 'w');
    ellipse(h, 8, 14, 5.4, 2, wing);
    ellipse(h, 9, 19, 5.5, 2.6, 'w');
    ellipse(h, 9, 19, 4.4, 1.6, wing);
    line(h, 12, 16, 6, 13, base);
    line(h, 12, 22, 6, 27, base);
    ellipse(h, 15.5, 21, 4.6, ry, base);
    for (const y of [17, 21, 25]) {
      for (let x = 10; x <= 15; x++) {
        const dx = (x - 15.5) / 4.6;
        const dy = (y - 21) / ry;
        if (dx * dx + dy * dy <= 1) {
          put(h, x, y, stripe);
          put(h, x, y + 1, stripe);
        }
      }
    }
    ellipse(h, 15.5, 10, 3.6, 3, base);
    put(h, 13, 9, 'W');
    line(h, 14, 7, 11, 3, 'k');
  });
  put(g, 15, 29, 'k');
  put(g, 16, 29, 'k');
  return toRows(g);
}

// ナナホシテントウ
function ladybug() {
  const g = symmetric((h) => {
    line(h, 10, 12, 5, 10, 'k');
    line(h, 9, 18, 4, 18, 'k');
    line(h, 10, 24, 5, 27, 'k');
    ellipse(h, 15.5, 19, 9, 10, 'k');
    ellipse(h, 15.5, 19.5, 8, 9, 'X');
    ellipse(h, 15.5, 8, 5, 3, 'k');
    put(h, 12, 8, 'W');
    put(h, 11, 8, 'W');
    // 星（七つのうち、左半分）
    for (const [x, y, r] of [[10, 15, 1.6], [9, 21, 1.8], [12, 25, 1.4]]) ellipse(h, x, y, r, r, 'k');
    line(h, 14, 5, 12, 2, 'k');
  });
  for (let y = 11; y < 29; y++) g[y][15] = 'k';
  g[13][15] = 'k';
  ellipse(g, 15.5, 17, 1.6, 1.6, 'k');
  return toRows(g);
}

// ツェツェバエ：翅をはさみのように重ねた姿
function tsetseFly() {
  const g = symmetric((h) => {
    line(h, 12, 12, 6, 9, 'R');
    line(h, 11, 17, 4, 17, 'R');
    line(h, 12, 22, 6, 27, 'R');
    // 翅（背中で重ねる）
    ellipse(h, 12, 22, 3, 9, 'w');
    ellipse(h, 12, 22, 2.2, 8, 'l');
    ellipse(h, 15.5, 22, 3.4, 8.5, 'h');
    ellipse(h, 15.5, 13, 3.6, 3.2, 'h');
    ellipse(h, 15.5, 8, 4, 3, 'R');
    put(h, 13, 7, 'W');
    line(h, 14, 5, 13, 1, 'R');
  });
  for (let y = 15; y < 30; y += 3) {
    g[y][15] = 'R';
    g[y][16] = 'R';
  }
  return toRows(g);
}

// ---------------- セミ・トンボ・カマキリ・ホタル ----------------
// wing：翅の色（アブラゼミは不透明の茶色）
function cicada({ body = 'R', wing = 'r', edge = 'R' }) {
  const g = symmetric((h) => {
    line(h, 11, 12, 6, 11, 'k');
    line(h, 11, 16, 5, 17, 'k');
    ellipse(h, 12, 21, 5.5, 10, edge);
    ellipse(h, 12, 21, 4.5, 9, wing);
    line(h, 12, 13, 11, 29, edge);
    line(h, 9, 14, 8, 27, edge);
    ellipse(h, 15.5, 12.5, 5.6, 4, body);
    ellipse(h, 15.5, 6.5, 6, 2.6, body);
    ellipse(h, 8.5, 6.8, 2, 2.4, 'k');
    put(h, 8, 6, 'W');
  });
  return toRows(g);
}

function mantisTop({ body = 'g', edge = 'G', wing = null, mark = null }) {
  const g = symmetric((h) => {
    // かま
    line(h, 13, 12, 7, 8, edge, 2);
    line(h, 7, 8, 8, 17, edge, 2);
    line(h, 8, 17, 12, 19, edge);
    for (const [x, y] of [[8, 10], [8, 12], [8, 14]]) put(h, x + 1, y, 'k');
    if (mark) put(h, 9, 12, mark);
    // 脚
    line(h, 14, 15, 8, 21, edge);
    line(h, 14, 18, 8, 26, edge);
    ellipse(h, 15.5, 24, 3.6, 7, body);
    if (wing) ellipse(h, 11.8, 22, 2, 7, wing);
    ellipse(h, 15.5, 13, 2.3, 5.5, body);
    ellipse(h, 15.5, 5.5, 3.6, 2.6, body);
    put(h, 12, 5, 'W');
    put(h, 12, 6, 'k');
    line(h, 14, 3, 11, 0, edge);
  });
  return toRows(g);
}

function dragonfly() {
  const g = symmetric((h) => {
    // 4枚の翅
    ellipse(h, 7, 11, 7, 2.2, 'w');
    ellipse(h, 7, 11, 6, 1.4, 'l');
    ellipse(h, 7, 16, 7.5, 2.4, 'w');
    ellipse(h, 7, 16, 6.5, 1.5, 'l');
    line(h, 13, 11, 4, 11, 'k');
    line(h, 13, 16, 3, 16, 'k');
    ellipse(h, 15.5, 8.5, 3, 3, 'n');
    ellipse(h, 15.5, 4.6, 3.6, 3, 'g');
    put(h, 13, 4, 'W');
  });
  rect(g, 15, 10, 2, 20, 'n');
  for (const y of [13, 17, 21, 25, 28]) rect(g, 15, y, 2, 1, 'y');
  rect(g, 14, 8, 4, 3, 'y');
  return toRows(g);
}

function firefly() {
  const g = symmetric((h) => {
    line(h, 11, 12, 6, 10, 'n');
    line(h, 10, 17, 5, 17, 'n');
    line(h, 11, 22, 6, 25, 'n');
    ellipse(h, 15.5, 19, 5.6, 8, 'n');
    ellipse(h, 15.5, 19, 4.6, 7, 'e');
    ellipse(h, 15.5, 9.5, 5.2, 3.6, 'p');
    ellipse(h, 15.5, 9.5, 4.2, 2.6, 'p');
    ellipse(h, 15.5, 5.5, 2.6, 1.8, 'n');
    put(h, 14, 5, 'W');
    line(h, 14, 4, 12, 1, 'n');
    // 光る腹
    ellipse(h, 15.5, 28, 4, 2.6, 'y');
    for (const [x, y] of [[9, 27], [8, 29], [10, 31], [11, 24]]) put(h, x, y, 'W');
  });
  // 胸の黒い十字
  line(g, 15, 7, 15, 12, 'n');
  line(g, 16, 7, 16, 12, 'n');
  line(g, 12, 9, 19, 9, 'n');
  return toRows(g);
}

// タマムシ・カミキリなど、細長い甲虫（上から）
function longBeetle({ body, edge, stripe = null, shine = 'W', antenna = null, antennaColor = null, jaw = null, ry = 10, rx = 5.4 }) {
  const g = symmetric((h) => {
    line(h, 12, 13, 6, 11, edge, 2);
    line(h, 11, 18, 5, 19, edge, 2);
    line(h, 12, 23, 6, 27, edge, 2);
    ellipse(h, 15.5, 21, rx + 0.9, ry, edge);
    ellipse(h, 15.5, 21, rx, ry - 1, body);
    ellipse(h, 15.5, 11.5, rx - 0.4, 3, edge);
    ellipse(h, 15.5, 11.5, rx - 1.4, 2, body);
    ellipse(h, 15.5, 7, 3, 2.2, edge);
    if (shine) {
      put(h, 12, 17, shine);
      put(h, 12, 18, shine);
    }
    if (stripe) {
      line(h, 12, 13, 12, 29, stripe);
      line(h, 13.5, 14, 13.5, 28, stripe);
    }
    if (antenna) for (let i = 0; i < antenna.length - 1; i++) line(h, antenna[i][0], antenna[i][1], antenna[i + 1][0], antenna[i + 1][1], antennaColor || edge);
    if (jaw) for (let i = 0; i < jaw.length - 1; i++) line(h, jaw[i][0], jaw[i][1], jaw[i + 1][0], jaw[i + 1][1], edge, 2);
  });
  for (let y = 12; y < 30; y++) {
    g[y][15] = edge;
    g[y][16] = edge;
  }
  return toRows(g);
}

// ---------------- 日本 ----------------
export const koKuwagata = () =>
  stagBeetle({ body: 'R', edge: 'n', legs: 'n', jaw: 'n', jawPath: [[12, 7], [9, 5], [8, 2]], tooth: [[10, 4, 1, 1]] });
export const hiratakuwagata = () =>
  stagBeetle({
    body: 'R',
    edge: 'n',
    seam: 'n',
    legs: 'n',
    jaw: 'R',
    jawPath: [[12, 7], [8, 6], [8, 3], [11, 1]],
    tooth: [[10, 4, 2, 2], [9, 2, 2, 1]],
    flat: true,
  });
export const aburazemi = () => cicada({ body: 'R', wing: 'r', edge: 'R' });
export const okamakiri = () => mantisTop({ body: 'g', edge: 'G', wing: 'g' });
export const genjiBotaru = () => firefly();
export const oniyanma = () => dragonfly();
export const yamatoTamamushi = () => longBeetle({ body: 'g', edge: 'G', stripe: 'd', shine: 'l' });
export const oomurasaki = () => butterfly({ main: 'v', edge: 'n', accent: 'b', spots: 'W', wide: true });

// コタツムシ（架空）：こたつに入って、頭だけ出す虫。上にみかん
export function kotatsuBug() {
  const g = createGrid(SIZE, SIZE);
  // こたつ布団（赤）
  rect(g, 3, 14, 26, 12, 'd');
  for (let x = 5; x < 28; x += 4) {
    put(g, x, 18, 'y');
    put(g, x + 2, 22, 'y');
  }
  rect(g, 3, 24, 26, 2, 'R');
  // 天板
  rect(g, 1, 11, 30, 3, 'r');
  rect(g, 1, 13, 30, 1, 'R');
  // 脚
  rect(g, 4, 26, 2, 5, 'R');
  rect(g, 26, 26, 2, 5, 'R');
  // みかん
  ellipse(g, 20, 8, 3.2, 2.8, 'o');
  put(g, 20, 5, 'g');
  put(g, 21, 5, 'g');
  ellipse(g, 15, 9, 2.6, 2.2, 'o');
  // こたつから顔を出す虫
  ellipse(g, 6, 20, 4.6, 4, 'g');
  put(g, 4, 19, 'k');
  put(g, 7, 19, 'k');
  put(g, 5, 22, 'd');
  put(g, 3, 17, 'W');
  // ぽかぽかの湯気
  for (const [x, y] of [[8, 6], [9, 4], [8, 2]]) put(g, x, y, 's');
  return toRows(g);
}

// ハナビムシ（架空）：線香花火をおしりに付けた虫。上に打ち上げ花火
export function fireworkBug() {
  const g = createGrid(SIZE, SIZE);
  // 打ち上げ花火（放射状）
  const cx = 16;
  const cy = 9;
  const colors = ['y', 'p', 'o', 'l'];
  for (let a = 0; a < 12; a++) {
    const rad = (a / 12) * Math.PI * 2;
    const c = colors[a % 4];
    line(g, cx + Math.cos(rad) * 2, cy + Math.sin(rad) * 2, cx + Math.cos(rad) * 8, cy + Math.sin(rad) * 8, c);
    put(g, cx + Math.cos(rad) * 9, cy + Math.sin(rad) * 9, 'W');
  }
  // 虫（浴衣のような紺色の体）
  ellipse(g, 16, 23, 6.5, 5.5, 'b');
  ellipse(g, 16, 23, 5.4, 4.4, 'b');
  for (const [x, y] of [[13, 22], [17, 25], [19, 21], [14, 26]]) put(g, x, y, 'W');
  ellipse(g, 16, 17, 3.6, 3, 'f');
  put(g, 14, 16, 'k');
  put(g, 18, 16, 'k');
  put(g, 16, 19, 'd');
  line(g, 12, 25, 9, 28, 'k');
  line(g, 20, 25, 23, 28, 'k');
  // 線香花火
  line(g, 22, 27, 27, 30, 'w');
  for (const [x, y] of [[28, 30], [29, 29], [28, 28], [30, 31], [27, 31]]) put(g, x, y, 'y');
  return toRows(g);
}

// ---------------- ヨーロッパ ----------------
export const seiyouMitsubachi = () => bee({ base: 'n', stripe: 'y' });
export const nanahoshiTento = () => ladybug();
export const kujakuchou = () => butterfly({ main: 'X', edge: 'n', eye: { ring: 'b' }, wide: true });
export const usubaKamakiri = () => mantisTop({ body: 't', edge: 'h', wing: 't', mark: 'k' });
export const apolloChou = () => butterfly({ main: 'w', edge: 'k', accent: 'W', spots: 'k', eye: { ring: 'X' } });

// ヨーロッパメンガタスズメ：ドクロの模様のある胸、黄色と黒の腹
export function deathsHeadMoth() {
  const g = symmetric((h) => {
    // 細長い前ばね
    line(h, 13, 12, 3, 7, 'R', 3);
    line(h, 13, 13, 2, 11, 'R', 3);
    ellipse(h, 8, 11, 6, 3.4, 'R');
    ellipse(h, 8, 11, 4.6, 2.4, 'h');
    // 後ろばね（黄色）
    ellipse(h, 8, 19, 5.5, 3.5, 'y');
    line(h, 5, 18, 12, 21, 'n');
    // 胸と、太い腹
    ellipse(h, 15.5, 12, 4.4, 3.6, 'n');
    ellipse(h, 15.5, 23, 3.8, 8, 'y');
    line(h, 14, 8, 10, 3, 'n');
  });
  for (const y of [17, 20, 23, 26, 29]) {
    rect(g, 13, y, 6, 1, 'n');
  }
  // 胸のドクロ
  rect(g, 13, 9, 6, 5, 'w');
  put(g, 14, 11, 'n');
  put(g, 17, 11, 'n');
  put(g, 14, 12, 'n');
  put(g, 17, 12, 'n');
  rect(g, 15, 13, 2, 1, 'n');
  ellipse(g, 15.5, 6.5, 2.4, 2, 'n');
  return toRows(g);
}

export const okujakuYamamayu = () => butterfly({ main: 's', edge: 'R', accent: 'h', eye: { ring: 'y' }, moth: true, wide: true });
export const ookashiKamikiri = () =>
  longBeetle({
    body: 'n',
    edge: 'e',
    antenna: [[14, 7], [7, 4], [2, 12], [2, 22], [4, 30]],
    antennaColor: 's',
    shine: 'W',
  });

// チーズムシ（架空）：穴のあいたチーズの形の虫
export function cheeseBug() {
  const g = createGrid(SIZE, SIZE);
  // チーズのくさび形（側面）
  for (let y = 8; y <= 26; y++) {
    const w = Math.round(24 - (y - 8) * 0.55);
    rect(g, 4, y, w, 1, 'y');
  }
  rect(g, 4, 8, 24, 1, 'h');
  line(g, 4, 8, 4, 26, 'h');
  rect(g, 4, 26, 14, 1, 'h');
  // 穴
  for (const [x, y, r] of [[9, 12, 1.8], [18, 11, 2.2], [13, 18, 2.2], [21, 16, 1.5], [8, 21, 1.5]]) ellipse(g, x, y, r, r, 'h');
  // 顔
  put(g, 16, 22, 'k');
  put(g, 19, 22, 'k');
  line(g, 16, 24, 19, 24, 'd');
  // 足
  line(g, 8, 27, 6, 31, 'k');
  line(g, 14, 27, 14, 31, 'k');
  // 小さなハエ（虫の仲間）ではなく、チーズのかけらと湯気の代わりの星
  put(g, 26, 5, 'W');
  put(g, 5, 5, 'W');
  return toRows(g);
}

// トケイムシ（架空）：時計台の形の虫
export function clockBug() {
  const g = createGrid(SIZE, SIZE);
  // 塔
  rect(g, 10, 12, 12, 17, 'r');
  rect(g, 11, 4, 10, 8, 'R');
  for (let i = 0; i < 4; i++) rect(g, 12 + i * 2 + 0, 2 + (i % 2), 2, 3, 'R');
  rect(g, 15, 0, 2, 3, 'y');
  // 文字盤
  ellipse(g, 16, 8, 4, 4, 'w');
  ellipse(g, 16, 8, 3.2, 3.2, 'w');
  line(g, 16, 8, 16, 5, 'k');
  line(g, 16, 8, 18, 9, 'k');
  for (const [x, y] of [[16, 4], [16, 12], [12, 8], [20, 8]]) put(g, x, y, 'k');
  // 顔（塔のまん中）
  put(g, 13, 19, 'k');
  put(g, 18, 19, 'k');
  line(g, 14, 23, 17, 23, 'd');
  // 窓
  rect(g, 12, 14, 2, 3, 'y');
  rect(g, 18, 14, 2, 3, 'y');
  // 足
  rect(g, 10, 29, 3, 3, 'k');
  rect(g, 19, 29, 3, 3, 'k');
  line(g, 9, 24, 5, 27, 'k');
  line(g, 23, 24, 27, 27, 'k');
  return toRows(g);
}

// ---------------- 東南アジア ----------------
export const oogomadara = () =>
  butterfly({ main: 'w', edge: 'k', accent: 'W', spots: 'k', wide: true, narrow: false, eye: null });
export const oomitsubachi = () => bee({ base: 'R', stripe: 'h', big: true });
export const himekabuto = () =>
  rhinoSide({
    body: 'R',
    edge: 'n',
    horns: (g) => {
      // 頭の角と胸の角が向かい合い、はさむ形
      line(g, 28, 20, 30, 12, 'n', 3);
      line(g, 30, 12, 27, 7, 'n', 2);
      line(g, 24, 16, 24, 10, 'n', 3);
      line(g, 24, 10, 27, 6, 'n', 2);
    },
  });
export const caucasusBeetle = () =>
  rhinoSide({
    body: 'h',
    edge: 'n',
    thorax: 'n',
    horns: (g) => {
      line(g, 28, 20, 31, 12, 'n', 3);
      line(g, 31, 12, 28, 6, 'n', 3);
      // 胸の2本の角（前に長く伸びる）
      line(g, 24, 15, 31, 12, 'n', 2);
      line(g, 25, 18, 31, 18, 'n', 2);
    },
  });

export function leafInsect() {
  const g = createGrid(SIZE, SIZE);
  // 脚（葉のような、平たいひれ付き）
  for (const [x, y] of [[9, 25], [15, 26], [21, 25], [9, 8], [15, 7], [21, 8]]) {
    ellipse(g, x, y, 2.8, 1.9, 'G');
    ellipse(g, x, y, 2, 1.2, 'q');
  }
  // 葉の体（両端がとがったレンズ形）
  for (let x = 3; x <= 27; x++) {
    const t = (x - 3) / 24;
    const half = Math.round(7.2 * Math.pow(Math.sin(Math.PI * t), 0.7));
    for (let y = 16 - half; y <= 16 + half; y++) put(g, x, y, y === 16 - half || y === 16 + half ? 'G' : 'q');
  }
  // 葉脈（中央の太い筋と、斜めの細い筋）
  line(g, 3, 16, 27, 16, 'y');
  for (const x of [8, 12, 16, 20]) {
    line(g, x, 16, x + 3, 11, 'G');
    line(g, x, 16, x + 3, 21, 'G');
  }
  // 頭
  ellipse(g, 28.5, 16, 2.4, 2, 'G');
  put(g, 29, 15, 'W');
  line(g, 30, 14, 31, 11, 'G');
  // 葉の先の、茎のような部分
  line(g, 0, 16, 3, 16, 'G');
  return toRows(g);
}

export const akaeriBirdwing = () =>
  butterfly({ main: 'n', edge: 'k', accent: 'g', spots: 'g', narrow: false, wide: true });

// チャンズ・メガスティック：世界最大級のナナフシ。枝のような細長い体
export function giantStick() {
  const g = createGrid(SIZE, SIZE);
  line(g, 3, 29, 28, 4, 'R', 2);
  line(g, 4, 28, 27, 3, 'r');
  // 節
  for (const [x, y] of [[8, 24], [13, 19], [18, 14], [23, 9]]) {
    put(g, x, y, 'h');
    put(g, x + 1, y - 1, 'h');
  }
  // 長い脚
  line(g, 8, 24, 2, 25, 'R');
  line(g, 13, 19, 6, 12, 'R');
  line(g, 13, 19, 18, 27, 'R');
  line(g, 18, 14, 27, 17, 'R');
  line(g, 18, 14, 12, 6, 'R');
  line(g, 23, 9, 30, 12, 'R');
  // 頭と触角
  put(g, 29, 3, 'R');
  put(g, 30, 2, 'R');
  line(g, 29, 3, 31, 0, 'R');
  put(g, 27, 3, 'W');
  return toRows(g);
}

export const goliathBirdwing = () => butterfly({ main: 'g', edge: 'n', accent: 'y', spots: 'y', narrow: true, wide: false });

// トゥクトゥクムシ（架空）：三輪タクシー（トゥクトゥク）の形の虫
export function tuktukBug() {
  const g = createGrid(SIZE, SIZE);
  // 屋根
  rect(g, 6, 7, 18, 3, 'y');
  rect(g, 5, 9, 20, 1, 'h');
  // 柱
  rect(g, 7, 10, 1, 9, 'R');
  rect(g, 23, 10, 1, 9, 'R');
  // 車体
  rect(g, 4, 19, 24, 6, 'g');
  rect(g, 4, 24, 24, 1, 'G');
  rect(g, 26, 16, 5, 3, 'g');
  put(g, 30, 17, 'y');
  // 運転している虫
  ellipse(g, 15, 15, 3.4, 3, 'l');
  put(g, 14, 14, 'k');
  put(g, 17, 14, 'k');
  line(g, 14, 17, 16, 17, 'd');
  // 車輪（前1、後ろ2）
  ellipse(g, 27, 27, 3.2, 3.2, 'k');
  ellipse(g, 27, 27, 1.2, 1.2, 's');
  ellipse(g, 8, 27, 3.2, 3.2, 'k');
  ellipse(g, 8, 27, 1.2, 1.2, 's');
  ellipse(g, 15, 27, 3.2, 3.2, 'k');
  ellipse(g, 15, 27, 1.2, 1.2, 's');
  // 排気の煙
  for (const [x, y] of [[2, 22], [1, 20], [2, 18]]) put(g, x, y, 's');
  return toRows(g);
}

// ドリアンムシ（架空）：トゲトゲのドリアンの形の虫
export function durianBug() {
  const g = createGrid(SIZE, SIZE);
  ellipse(g, 16, 20, 11, 9, 'G');
  ellipse(g, 16, 20, 10, 8, 'y');
  // トゲ
  for (let a = 0; a < 20; a++) {
    const rad = (a / 20) * Math.PI * 2;
    const x0 = 16 + Math.cos(rad) * 10.5;
    const y0 = 20 + Math.sin(rad) * 8.5;
    line(g, x0, y0, 16 + Math.cos(rad) * 13.5, 20 + Math.sin(rad) * 11, 'G');
  }
  for (const [x, y] of [[9, 17], [14, 14], [20, 15], [24, 19], [11, 24], [18, 26], [22, 23]]) put(g, x, y, 'h');
  // 顔（くさそうな表情）
  put(g, 12, 19, 'k');
  put(g, 20, 19, 'k');
  line(g, 13, 24, 19, 24, 'd');
  // においの線
  for (const [x, y] of [[10, 5], [11, 4], [10, 3], [11, 2], [21, 5], [22, 4], [21, 3], [22, 2]]) put(g, x, y, 's');
  return toRows(g);
}

// ---------------- 南米 ----------------
// グンタイアリ：大きな頭と、大あごの兵アリ
export function armyAnt() {
  const g = symmetric((h) => {
    line(h, 14, 15, 7, 12, 'R');
    line(h, 14, 17, 6, 18, 'R');
    line(h, 14, 19, 8, 26, 'R');
    ellipse(h, 15.5, 25, 4.2, 5.5, 'R');
    ellipse(h, 15.5, 25, 3.2, 4.5, 'B');
    ellipse(h, 15.5, 17.5, 2.6, 3.4, 'B');
    // 大きな頭
    ellipse(h, 15.5, 10, 5.2, 4.4, 'R');
    ellipse(h, 15.5, 10, 4.2, 3.4, 'B');
    put(h, 12, 9, 'W');
    // 大あご
    line(h, 13, 6, 11, 2, 'n', 2);
    line(h, 11, 2, 13, 0, 'n');
  });
  return toRows(g);
}

export const hyomonDokuchou = () => butterfly({ main: 'o', edge: 'k', spots: 'k', accent: 'y', narrow: true });

// ツノゼミ：頭の上に、枝分かれした奇妙なヘルメット
export function treehopper() {
  const g = createGrid(SIZE, SIZE);
  // 体
  ellipse(g, 16, 25, 8, 4.4, 'G');
  ellipse(g, 16, 25, 7, 3.4, 'g');
  line(g, 10, 28, 8, 31, 'G');
  line(g, 16, 29, 16, 31, 'G');
  line(g, 22, 28, 24, 31, 'G');
  // 頭
  ellipse(g, 23, 24, 3, 2.8, 'g');
  put(g, 24, 23, 'k');
  // ヘルメット（柱と、先が分かれた玉）
  rect(g, 15, 10, 2, 14, 'n');
  for (const [x, y] of [[9, 9], [12, 6], [16, 4], [20, 6], [23, 9]]) {
    line(g, 16, 10, x, y, 'n');
    ellipse(g, x, y, 1.6, 1.6, 'y');
  }
  return toRows(g);
}

// ハリナシバチ：小さなハチと、樹脂でできた巣の入口
export function stinglessBee() {
  const g = createGrid(SIZE, SIZE);
  // 巣の入口（ラッパ形の管）
  rect(g, 13, 20, 6, 11, 'R');
  rect(g, 11, 18, 10, 3, 'r');
  rect(g, 10, 17, 12, 1, 'r');
  rect(g, 14, 21, 4, 8, 'n');
  for (const [x, y] of [[13, 25], [18, 27]]) put(g, x, y, 'h');
  // ハチ（小さな体）
  ellipse(g, 8, 10, 6, 2.4, 'w');
  ellipse(g, 8, 10, 5, 1.5, 'l');
  ellipse(g, 21, 10, 6, 2.4, 'w');
  ellipse(g, 21, 10, 5, 1.5, 'l');
  ellipse(g, 15.5, 12, 3.2, 5, 'n');
  for (const y of [11, 13, 15]) rect(g, 13, y, 5, 1, 'y');
  ellipse(g, 15.5, 6, 2.8, 2.4, 'n');
  put(g, 14, 6, 'W');
  line(g, 14, 4, 12, 1, 'k');
  line(g, 17, 4, 19, 1, 'k');
  return toRows(g);
}

export const elephasBeetle = () =>
  rhinoSide({
    body: 't',
    edge: 'h',
    horns: (g) => {
      line(g, 28, 20, 30, 14, 'h', 3);
      line(g, 30, 14, 28, 10, 'h', 2);
      line(g, 24, 16, 30, 13, 'h', 3);
      for (const [x, y] of [[20, 14], [22, 13], [24, 13], [26, 15]]) put(g, x, y, 'y');
    },
  });

export const owlButterfly = () => butterfly({ main: 'r', edge: 'R', owl: true, wide: true });

export const titanBeetle = () =>
  longBeetle({
    body: 'r',
    edge: 'R',
    ry: 10.5,
    rx: 6.4,
    antenna: [[14, 7], [8, 5], [4, 10], [3, 18]],
    jaw: [[13, 5], [10, 2], [11, 0]],
    shine: 'W',
  });

export const neptuneBeetle = () =>
  rhinoSide({
    body: 'n',
    edge: 'e',
    horns: (g) => {
      // 非常に細長い、頭の角と胸の角（先で向かい合う）
      line(g, 28, 20, 31, 11, 'e', 2);
      line(g, 31, 11, 28, 2, 'e', 2);
      line(g, 24, 16, 23, 9, 'e', 2);
      line(g, 23, 9, 27, 3, 'e', 2);
      for (const [x, y] of [[24, 12], [25, 11], [24, 10], [23, 13]]) put(g, x, y, 'o');
    },
  });

// リフティングムシ（架空）：サッカーボールをリフティングする虫
export function liftingBug() {
  const g = createGrid(SIZE, SIZE);
  // ボール
  ellipse(g, 16, 6, 5, 5, 'w');
  for (const [x, y] of [[16, 6], [12, 4], [20, 4], [13, 9], [19, 9]]) ellipse(g, x, y, 1.2, 1.2, 'k');
  // 虫（緑と黄色のユニフォーム）
  ellipse(g, 16, 22, 6, 6, 'g');
  ellipse(g, 16, 22, 5, 5, 'g');
  rect(g, 11, 19, 10, 2, 'y');
  ellipse(g, 16, 15, 3.4, 3, 'f');
  put(g, 14, 14, 'k');
  put(g, 18, 14, 'k');
  line(g, 15, 17, 17, 17, 'd');
  // ボールを蹴り上げる脚
  line(g, 20, 25, 24, 20, 'k', 2);
  line(g, 24, 20, 22, 12, 'k');
  line(g, 12, 26, 10, 31, 'k', 2);
  line(g, 18, 27, 18, 31, 'k', 2);
  put(g, 4, 5, 'y');
  put(g, 27, 10, 'y');
  return toRows(g);
}

// マテチャムシ（架空）：マテ茶をストローで飲む虫
export function mateBug() {
  const g = createGrid(SIZE, SIZE);
  // ひょうたんのカップ
  ellipse(g, 10, 22, 6, 7, 'r');
  ellipse(g, 10, 22, 5, 6, 'h');
  rect(g, 6, 15, 8, 2, 'R');
  // ストロー（金属）
  line(g, 10, 16, 18, 8, 's', 2);
  // 湯気
  for (const [x, y] of [[8, 12], [9, 10], [8, 8], [10, 6]]) put(g, x, y, 'w');
  // 虫
  ellipse(g, 22, 22, 6.5, 6, 'g');
  ellipse(g, 22, 22, 5.5, 5, 'G');
  ellipse(g, 20, 13, 3.8, 3.2, 'g');
  put(g, 19, 12, 'k');
  put(g, 22, 12, 'k');
  line(g, 18, 8, 19, 12, 's');
  line(g, 25, 26, 28, 30, 'k');
  line(g, 19, 27, 18, 31, 'k');
  put(g, 27, 20, 'W');
  return toRows(g);
}

// ---------------- アフリカ ----------------
export function driverAnt() {
  const g = symmetric((h) => {
    line(h, 14, 15, 7, 12, 'R');
    line(h, 14, 17, 6, 18, 'R');
    line(h, 14, 19, 8, 26, 'R');
    ellipse(h, 15.5, 25, 4.2, 5.5, 'R');
    ellipse(h, 15.5, 25, 3.2, 4.5, 'h');
    ellipse(h, 15.5, 17.5, 2.6, 3.4, 'h');
    ellipse(h, 15.5, 9.5, 5.6, 4.8, 'R');
    ellipse(h, 15.5, 9.5, 4.6, 3.8, 'h');
    put(h, 12, 8, 'W');
    // 大きな鎌のような大あご
    line(h, 12, 5, 9, 2, 'n', 2);
    line(h, 9, 2, 12, 0, 'n');
  });
  return toRows(g);
}

export const tsetse = () => tsetseFly();

// キリンクビナガオトシブミ：長い首と、赤いはね
export function giraffeWeevil() {
  const g = createGrid(SIZE, SIZE);
  // 赤い胴
  ellipse(g, 12, 23, 9, 6.4, 'n');
  ellipse(g, 12, 23, 8, 5.4, 'd');
  line(g, 4, 23, 20, 23, 'n');
  // 長い首
  line(g, 19, 20, 24, 8, 'n', 3);
  // 頭と触角
  ellipse(g, 26, 6, 2.6, 2.2, 'n');
  put(g, 27, 5, 'W');
  line(g, 27, 4, 30, 2, 'n');
  // 脚
  line(g, 7, 28, 5, 31, 'n');
  line(g, 12, 29, 12, 31, 'n');
  line(g, 18, 28, 20, 31, 'n');
  return toRows(g);
}

// アフリカメダマカマキリ：白と緑、翅に目玉模様
export function spinyFlowerMantis() {
  const g = mantisTop({ body: 'w', edge: 'g', wing: 'w' });
  const grid = g.map((r) => r.split(''));
  for (const [x, y, r] of [[11, 22, 2.4], [20, 22, 2.4]]) {
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const d = dx * dx + dy * dy;
        const px = Math.round(x + dx);
        const py = Math.round(y + dy);
        if (px < 0 || px >= SIZE || py < 0 || py >= SIZE) continue;
        if (d <= r * r * 0.35) grid[py][px] = 'k';
        else if (d <= r * r) grid[py][px] = 'y';
      }
  }
  return grid.map((r) => r.join(''));
}

// デビルズフラワーマンティス：前脚を立てて、赤・青・白の模様を見せる威嚇
export function devilFlowerMantis() {
  const g = createGrid(SIZE, SIZE);
  // 体（中央）
  ellipse(g, 16, 22, 4.4, 8, 'g');
  ellipse(g, 16, 14, 2.6, 5, 'g');
  ellipse(g, 16, 8, 3.6, 2.8, 'g');
  put(g, 14, 7, 'W');
  put(g, 18, 7, 'W');
  // 立てた前脚（内側に、赤・青・白・紫の模様）
  for (const side of [-1, 1]) {
    const x0 = 16 + side * 3;
    line(g, x0, 15, 16 + side * 11, 8, 'G', 2);
    line(g, 16 + side * 11, 8, 16 + side * 12, 1, 'G', 2);
    const cx = 16 + side * 9;
    ellipse(g, cx, 10, 3.6, 4.4, 'd');
    ellipse(g, cx, 10, 2.4, 3.2, 'b');
    ellipse(g, cx, 10, 1.2, 1.6, 'w');
    put(g, cx, 5, 'v');
    put(g, cx + side, 14, 'v');
  }
  // 脚
  line(g, 13, 20, 8, 27, 'G');
  line(g, 19, 20, 24, 27, 'G');
  return toRows(g);
}

// マントファスマ：かかとで歩くように見える、はねのない小さな昆虫（横から）
export function gladiator() {
  const g = createGrid(SIZE, SIZE);
  // 細長い体
  line(g, 6, 18, 24, 14, 'h', 3);
  line(g, 24, 14, 27, 11, 'h', 2);
  ellipse(g, 28, 10, 2.4, 2, 'h');
  put(g, 29, 9, 'W');
  put(g, 29, 10, 'k');
  line(g, 29, 8, 31, 4, 'h');
  // 前脚（かまのように折りたたむ）
  line(g, 22, 15, 27, 18, 'R');
  line(g, 27, 18, 26, 21, 'R');
  // 歩く脚（つま先を上げ、かかとで立つように）
  for (const [x0, y0, x1, y1] of [[10, 19, 8, 27], [15, 18, 15, 27], [20, 16, 21, 26]]) {
    line(g, x0, y0, x1, y1, 'R');
    put(g, x1 - 1, y1 - 1, 'R');
    put(g, x1 - 2, y1 - 2, 'R');
    put(g, x1, y1 + 1, 'k');
  }
  // 「つま先を上げる」しるしの小さな矢印
  put(g, 4, 22, 'y');
  put(g, 5, 21, 'y');
  put(g, 4, 20, 'y');
  return toRows(g);
}

export const centaurusBeetle = () =>
  rhinoSide({
    body: 'B',
    edge: 'R',
    horns: (g) => {
      // 頭の角と、先が分かれた胸の角
      line(g, 28, 20, 31, 12, 'R', 3);
      line(g, 31, 12, 29, 8, 'R', 2);
      line(g, 24, 16, 28, 9, 'R', 3);
      line(g, 28, 9, 30, 6, 'R', 2);
      line(g, 28, 9, 26, 6, 'R', 2);
    },
  });

export const cometMoth = () => {
  const rows = butterfly({ main: 'y', edge: 'o', accent: 'o', eye: { ring: 'X' }, moth: true, tail: false, wide: true });
  const g = rows.map((r) => r.split(''));
  // 後ろばねから伸びる、長い尾
  for (const [x0, x1] of [[9, 4], [22, 27]]) {
    for (let i = 0; i <= 7; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / 7);
      const y = 24 + i;
      for (const dx of [0, 1]) if (g[y] && x + dx >= 0 && x + dx < SIZE) g[y][x + dx] = 'y';
    }
    g[31][x1] = 'o';
  }
  return g.map((r) => r.join(''));
};

// サファリムシ（架空）：ジープで、双眼鏡を持つ虫
export function safariBug() {
  const g = createGrid(SIZE, SIZE);
  // ジープ
  rect(g, 2, 17, 28, 8, 'h');
  rect(g, 2, 24, 28, 1, 'R');
  rect(g, 6, 12, 14, 5, 'h');
  rect(g, 7, 13, 12, 4, 'l');
  rect(g, 20, 14, 1, 4, 'R');
  rect(g, 27, 15, 3, 2, 'y');
  // 虫（サファリ帽と双眼鏡）
  ellipse(g, 12, 10, 3.4, 3, 'g');
  ellipse(g, 12, 6.5, 5, 1.4, 't');
  ellipse(g, 12, 5.4, 2.8, 1.8, 't');
  put(g, 10, 10, 'W');
  rect(g, 8, 10, 3, 2, 'k');
  rect(g, 12, 10, 3, 2, 'k');
  // 車輪
  ellipse(g, 8, 27, 3.4, 3.4, 'k');
  ellipse(g, 8, 27, 1.2, 1.2, 's');
  ellipse(g, 24, 27, 3.4, 3.4, 'k');
  ellipse(g, 24, 27, 1.2, 1.2, 's');
  // 砂ぼこり
  for (const [x, y] of [[0, 26], [1, 28], [0, 30]]) put(g, x, y, 't');
  return toRows(g);
}

// キリマンジャロムシ（架空）：雪をかぶった山の形の虫
export function kilimanjaroBug() {
  const g = createGrid(SIZE, SIZE);
  // 山
  for (let y = 6; y <= 27; y++) {
    const half = Math.round(2 + (y - 6) * 0.68);
    rect(g, 16 - half, y, half * 2, 1, 'r');
  }
  // 雪
  for (let y = 6; y <= 12; y++) {
    const half = Math.round(2 + (y - 6) * 0.68);
    rect(g, 16 - half, y, half * 2, 1, 'w');
  }
  for (const [x, y] of [[13, 13], [15, 13], [18, 14], [11, 12], [21, 12]]) put(g, x, y, 'w');
  // 顔
  put(g, 12, 19, 'k');
  put(g, 19, 19, 'k');
  line(g, 14, 23, 17, 23, 'd');
  // 足
  line(g, 9, 27, 6, 31, 'k', 2);
  line(g, 23, 27, 26, 31, 'k', 2);
  // 雲
  ellipse(g, 6, 8, 3, 1.4, 'w');
  ellipse(g, 26, 4, 3.4, 1.4, 'w');
  return toRows(g);
}
