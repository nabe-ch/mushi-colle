// 虫のデータと、ドット絵（32×32）。ドット絵は pixel.js の道具でその場で組み立てる。
// 「大きさ（sizeText）」の実在種の数値は、日本語版Wikipediaの記載（2026-09-25確認、確度B）に基づく。
// 実在種の説明文は、事実（生態）を踏まえたうえで、遊び心のある言い回しにしている。架空の虫は「架空」と明記する
import { createGrid, put, rect, ellipse, line, mirrorX, toRows } from './pixel';

export const RARITY = {
  common: { label: 'コモン', color: '#9dbb9a', order: 0 },
  rare: { label: 'レア', color: '#5c8ac9', order: 1 },
  epic: { label: 'エピック', color: '#b47ee0', order: 2 },
  unique: { label: 'ユニーク', color: '#e0c04a', order: 3 },
};

const SIZE = 32;

// 左半分だけ描いて、左右に反転して合成する（対称な虫を描きやすくするため）
function symmetric(drawLeft) {
  const left = createGrid(SIZE, SIZE);
  drawLeft(left);
  const right = mirrorX(left);
  const out = createGrid(SIZE, SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      out[y][x] = left[y][x] !== '.' ? left[y][x] : right[y][x];
    }
  }
  return out;
}

// クワガタの体（上から見た形。頭が上）。opts で色・大あごの形・体の形を変える
function stagBeetle(opts) {
  const { body, edge, legs, jaw, jawPath, tooth = [], serrations = 0, ears = false, flat = false, groove, thigh } = opts;
  const g = symmetric((h) => {
    // 脚（体より先に描く）
    line(h, 11, 12, 4, 9, legs, 2);
    line(h, 10, 17, 2, 17, legs, 2);
    line(h, 11, 22, 4, 27, legs, 2);
    if (thigh) {
      rect(h, 7, 10, 2, 2, thigh);
      rect(h, 5, 16, 2, 2, thigh);
      rect(h, 7, 23, 2, 2, thigh);
    }
    // はね（縁取り→中身）。flat は、四角く平たい体（オオクワガタ）
    if (flat) {
      rect(h, 8, 14, 8, 16, edge);
      rect(h, 9, 15, 7, 14, body);
    } else {
      ellipse(h, 15.5, 21, 8.5, 9.5, edge);
      ellipse(h, 15.5, 21, 7, 8, body);
    }
    // 胸
    ellipse(h, 15.5, 12, 6.5, 3.6, edge);
    ellipse(h, 15.5, 12, 5.2, 2.5, body);
    // 頭
    ellipse(h, 15.5, 8, 5.2, 2.6, edge);
    put(h, 12, 8, 'W');
    // 耳のような突起（ミヤマクワガタ）
    if (ears) {
      rect(h, 8, 7, 3, 3, edge);
      put(h, 8, 8, jaw);
    }
    // 大あご（太さ3）
    for (let i = 0; i < jawPath.length - 1; i++) {
      line(h, jawPath[i][0], jawPath[i][1], jawPath[i + 1][0], jawPath[i + 1][1], jaw, 3);
    }
    // ノコギリ状のギザギザ（内側に小さな突起を並べる）
    let count = 0;
    for (let i = 0; i < jawPath.length - 1 && count < serrations; i++) {
      const [ax, ay] = jawPath[i];
      const [bx, by] = jawPath[i + 1];
      const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
      for (let s = 1; s < steps && count < serrations; s += 2) {
        put(h, ax + ((bx - ax) * s) / steps + 2, ay + ((by - ay) * s) / steps, jaw);
        put(h, ax + ((bx - ax) * s) / steps + 3, ay + ((by - ay) * s) / steps, jaw);
        count += 1;
      }
    }
    // 大きな内歯（ミヤマ・オオクワガタ）
    for (const [x, y, w, hh] of tooth) rect(h, x, y, w, hh, jaw);
    if (groove) {
      line(h, 11.5, 15, 11, 28, groove);
      line(h, 13.5, 15, 13.5, 28, groove);
    }
    // つや
    put(h, 10, 18, 'W');
    put(h, 10, 19, 'W');
    put(h, 11, 17, 'W');
  });
  // 背中の合わせ目
  for (let y = 14; y < 30; y++) {
    g[y][15] = opts.seam || opts.edge;
    g[y][16] = opts.seam || opts.edge;
  }
  return toRows(g);
}

// カブトムシは、角が一番の特徴なので、横から見た姿で描く（頭が右）
function rhinoBeetle() {
  const g = createGrid(SIZE, SIZE);
  // 脚
  line(g, 9, 26, 5, 31, 'R', 2);
  line(g, 15, 27, 14, 31, 'R', 2);
  line(g, 21, 26, 24, 31, 'R', 2);
  // はね（ドーム型）
  ellipse(g, 12, 20, 11, 8.5, 'R');
  ellipse(g, 12, 20, 9.6, 7.2, 'B');
  // 胸・頭
  ellipse(g, 23, 20, 5.5, 5.5, 'R');
  ellipse(g, 23, 20, 4.2, 4.2, 'B');
  ellipse(g, 28, 22, 3, 3, 'R');
  // 頭の大きな角（上向きに伸びて、先が二又）
  line(g, 28, 20, 30, 12, 'R', 3);
  line(g, 30, 12, 27, 5, 'R', 3);
  line(g, 27, 5, 24, 3, 'R', 2);
  line(g, 27, 5, 30, 2, 'R', 2);
  // 胸の角（前に向かって伸びる、短い角）
  line(g, 24, 17, 25, 11, 'R', 2);
  line(g, 25, 11, 27, 9, 'R');
  // 目・つや・はねの筋
  put(g, 29, 22, 'W');
  put(g, 7, 15, 'W');
  put(g, 8, 15, 'W');
  put(g, 6, 16, 'W');
  for (let x = 4; x <= 20; x++) put(g, x, 20, 'R');
  return toRows(g);
}

// 架空の虫：麦わら帽子をかぶり、宿題のノートを抱えたテントウムシ風の丸い虫
function summerHomeworkBug() {
  const g = symmetric((h) => {
    line(h, 11, 20, 5, 17, 'k');
    line(h, 10, 24, 5, 27, 'k');
    ellipse(h, 15.5, 22, 8, 7, 'o');
    ellipse(h, 15.5, 22, 6.8, 5.8, 'o');
    put(h, 11, 20, 'k');
    put(h, 12, 20, 'k');
    put(h, 11, 24, 'k');
    // 顔
    ellipse(h, 15.5, 14.5, 5, 3.6, 'f');
    put(h, 13, 14, 'k');
    put(h, 13, 15, 'k');
    line(h, 14, 17, 15, 17, 'd');
    // 帽子（つば→クラウン→帯）
    ellipse(h, 15.5, 11.5, 9, 1.6, 't');
    ellipse(h, 15.5, 9.4, 4.4, 2.8, 't');
    line(h, 12, 10.6, 15.5, 10.6, 'd');
  });
  // 宿題のノート
  rect(g, 2, 20, 10, 9, 'w');
  rect(g, 2, 20, 2, 9, 'b');
  line(g, 5, 23, 10, 23, 'b');
  line(g, 5, 25, 10, 25, 'b');
  line(g, 5, 27, 8, 27, 'b');
  return toRows(g);
}

export const INSECTS = [
  {
    id: 'jp_kabuto',
    region: 'japan',
    name: 'カブトムシ',
    rarity: 'common',
    price: 10,
    sizeText: 'オス 2.3〜8.8cm（角を含む）',
    description:
      '夜の樹液バーの常連。朝になると土にもぐり、「昨日の記憶はない」という顔をしている。',
    grid: rhinoBeetle(),
  },
  {
    id: 'jp_nokogiri',
    region: 'japan',
    name: 'ノコギリクワガタ',
    rarity: 'common',
    price: 12,
    sizeText: 'オス 2.6〜7.7cm（大あごを含む）',
    description:
      'ギザギザの大あごで自己紹介する。握手のつもりが、たいてい痛がられる。',
    grid: stagBeetle({
      body: 'h',
      edge: 'R',
      legs: 'R',
      jaw: 'R',
      jawPath: [[12, 7], [8, 5], [6, 2], [8, 0]],
      serrations: 4,
    }),
  },
  {
    id: 'jp_miyama',
    region: 'japan',
    name: 'ミヤマクワガタ',
    rarity: 'rare',
    price: 40,
    sizeText: 'オス 2.3〜7.9cm（大あごを含む）',
    description:
      '頭の後ろに、耳みたいな突起がある山ぐらしの通。聞き上手を自称しているらしい。',
    grid: stagBeetle({
      body: 'r',
      edge: 'R',
      legs: 'R',
      thigh: 'y',
      jaw: 'R',
      jawPath: [[12, 7], [9, 5], [8, 2], [9, 0]],
      tooth: [[10, 3, 2, 2]],
      ears: true,
    }),
  },
  {
    id: 'jp_okuwa',
    region: 'japan',
    name: 'オオクワガタ',
    rarity: 'epic',
    price: 150,
    sizeText: 'オス 2.1〜7.7cm（野生・大あごを含む）',
    description:
      'クヌギの巨木に住む、黒光りの王様。数が減っていて、環境省レッドリストでは絶滅危惧II類とされている。見つけたら、そっと拍手。',
    grid: stagBeetle({
      body: 'n',
      edge: 'e',
      seam: 'e',
      legs: 'e',
      jaw: 'n',
      jawPath: [[12, 7], [9, 6], [8, 3], [10, 1]],
      tooth: [[10, 4, 2, 2]],
      flat: true,
      groove: 'e',
    }),
  },
  {
    id: 'jp_natsuyasumi',
    region: 'japan',
    name: 'ナツヤスミムシ',
    rarity: 'unique',
    price: 120,
    sizeText: '約3cm（架空の虫）',
    description:
      '【架空の虫】宿題を抱えた夏休みの虫。8月31日になると、なぜか動きが急に速くなる。',
    grid: summerHomeworkBug(),
  },
];

// 地域ごとの道具（2026-09-25、ユーザー指定：「地域によってたたくためのものを変える。地域特性にあっていれば、
// 本来の使用目的が『たたく』でなくてもOK。グレードは地域で隔てる（日本で最大でも、他の地域では購入していなければレベル1）」）。
// power は1回のクリックの効き方（倍率）、rarities は、その等級で出るようになる虫のレア度、color は、絵の道具の頭の色
const ALL_RARITIES = ['common', 'rare', 'epic', 'unique'];

export const REGIONS = [
  {
    id: 'japan',
    name: '日本',
    tree: 'クヌギ',
    available: true,
    tools: [
      { name: '木の棒', power: 1, cost: 0, rarities: ALL_RARITIES.slice(0, 1), color: 'h' },
      { name: '木槌（きづち）', power: 1.3, cost: 60, rarities: ALL_RARITIES.slice(0, 2), color: 'B' },
      { name: '鉄の金槌', power: 1.7, cost: 250, rarities: ALL_RARITIES.slice(0, 3), color: 's' },
      { name: '打ち出の小槌', power: 2.2, cost: 800, rarities: ALL_RARITIES, color: 'y' },
    ],
    // 世界地図上の位置（横・縦、%）
    pin: { x: 91.5, y: 37 },
  },
  { id: 'sea', name: '東南アジア', tree: '熱帯雨林の巨木', available: false, tools: [], pin: { x: 79, y: 62 } },
  { id: 'amazon', name: '南米', tree: 'カポックの巨木', available: false, tools: [], pin: { x: 31, y: 75 } },
  { id: 'africa', name: 'アフリカ', tree: 'バオバブ', available: false, tools: [], pin: { x: 52, y: 62 } },
  { id: 'europe', name: 'ヨーロッパ', tree: 'オーク', available: false, tools: [], pin: { x: 52, y: 29 } },
];

export function getRegion(id) {
  return REGIONS.find((r) => r.id === id);
}

export function getInsect(id) {
  return INSECTS.find((i) => i.id === id);
}

export function insectsOfRegion(regionId) {
  return INSECTS.filter((i) => i.region === regionId);
}
