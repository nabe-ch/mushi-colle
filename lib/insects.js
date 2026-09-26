// 虫のデータと、ドット絵（32×32）。ドット絵は pixel.js の道具でその場で組み立てる。
// 「大きさ（sizeText）」の実在種の数値は、日本語版Wikipediaの記載（2026-09-25確認、確度B）に基づく。
// 実在種の説明文は、事実（生態）を踏まえたうえで、遊び心のある言い回しにしている。架空の虫は「架空」と明記する
import { createGrid, put, rect, ellipse, line, mirrorX, toRows } from './pixel';
import { EXTRA_INSECTS } from './insectsMore';
import {
  stagBeetle,
  leafcutterAnt,
  morphoButterfly,
  actaeonBeetle,
  herculesBeetle,
  hammockBug,
  weaverAnt,
  orchidMantis,
  atlasBeetle,
  giraffeStag,
  karaokeBug,
  scarabBeetle,
  desertLocust,
  hissingRoach,
  goliathBeetle,
  baobabBug,
} from './bugArtWorld';

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

// サイカブト・カブトムシ系は、角が一番の特徴なので、横から見た姿で描く（頭が右）。
// body：はねの色、edge：縁と角の色、fork：角の先が二又（日本のカブトムシ）か、1本の角（ヨーロッパサイカブト）か
function rhinoBeetle({ body = 'B', edge = 'R', fork = true } = {}) {
  const g = createGrid(SIZE, SIZE);
  // 脚
  line(g, 9, 26, 5, 31, edge, 2);
  line(g, 15, 27, 14, 31, edge, 2);
  line(g, 21, 26, 24, 31, edge, 2);
  // はね（ドーム型）
  ellipse(g, 12, 20, 11, 8.5, edge);
  ellipse(g, 12, 20, 9.6, 7.2, body);
  // 胸・頭
  ellipse(g, 23, 20, 5.5, 5.5, edge);
  ellipse(g, 23, 20, 4.2, 4.2, body);
  ellipse(g, 28, 22, 3, 3, edge);
  if (fork) {
    // 頭の大きな角（上向きに伸びて、先が二又）
    line(g, 28, 20, 30, 12, edge, 3);
    line(g, 30, 12, 27, 5, edge, 3);
    line(g, 27, 5, 24, 3, edge, 2);
    line(g, 27, 5, 30, 2, edge, 2);
    // 胸の角（前に向かって伸びる、短い角）
    line(g, 24, 17, 25, 11, edge, 2);
    line(g, 25, 11, 27, 9, edge);
  } else {
    // 頭の角：1本、後ろ向きに反った形（ヨーロッパサイカブトのオス）
    line(g, 28, 20, 30, 14, edge, 3);
    line(g, 30, 14, 28, 8, edge, 2);
    put(g, 27, 7, edge);
  }
  // 目・つや・はねの筋
  put(g, 29, 22, 'W');
  put(g, 7, 15, 'W');
  put(g, 8, 15, 'W');
  put(g, 6, 16, 'W');
  for (let x = 4; x <= 20; x++) put(g, x, 20, edge);
  return toRows(g);
}

// キンイロハナムグリ：金属のような緑色の、丸みのある体。白い小さな斑点がある
function roseChafer() {
  const g = symmetric((h) => {
    line(h, 11, 13, 5, 10, 'G', 2);
    line(h, 10, 18, 3, 18, 'G', 2);
    line(h, 11, 23, 5, 27, 'G', 2);
    ellipse(h, 15.5, 20.5, 9, 10, 'G');
    ellipse(h, 15.5, 20.5, 7.8, 8.8, 'g');
    ellipse(h, 15.5, 11.5, 6.2, 3.6, 'G');
    ellipse(h, 15.5, 11.5, 5, 2.6, 'g');
    ellipse(h, 15.5, 7, 4.2, 2, 'G');
    put(h, 12, 7, 'W');
    // つやと、白い斑点
    for (const [x, y] of [[10, 17], [10, 18], [11, 16], [9, 12]]) put(h, x, y, 'W');
    for (const [x, y] of [[8, 22], [12, 26], [9, 25], [12, 21]]) put(h, x, y, 'W');
  });
  for (let y = 13; y < 30; y++) {
    g[y][15] = 'G';
    g[y][16] = 'G';
  }
  return toRows(g);
}

// ヨーロッパコフキコガネ：茶色のはね、黒い頭と胸、扇のような触角、体の脇に並ぶ白い三角の模様
function cockchafer() {
  const g = symmetric((h) => {
    line(h, 11, 12, 5, 9, 'n', 2);
    line(h, 10, 17, 3, 17, 'n', 2);
    line(h, 11, 22, 5, 27, 'n', 2);
    // おしりの先（はねの下から少し見える）
    ellipse(h, 15.5, 28.5, 4.5, 2.6, 'R');
    // はね
    ellipse(h, 15.5, 20.5, 7.6, 9.5, 'R');
    ellipse(h, 15.5, 20.5, 6.5, 8.4, 'r');
    // 体の脇の白い三角
    for (const [x, y] of [[8, 22], [9, 22], [9, 25], [10, 25], [10, 28], [11, 28]]) put(h, x, y, 'w');
    // 胸・頭
    ellipse(h, 15.5, 11.5, 5.6, 3.4, 'n');
    ellipse(h, 15.5, 7.5, 3.6, 2.2, 'n');
    put(h, 13, 7, 'W');
    // 扇のような触角
    line(h, 13, 6, 10, 3, 'n');
    line(h, 10, 3, 8, 1, 'n');
    line(h, 10, 3, 8, 3, 'n');
    line(h, 10, 3, 9, 5, 'n');
    put(h, 10, 18, 'W');
    put(h, 10, 19, 'W');
  });
  for (let y = 13; y < 30; y++) {
    g[y][15] = 'R';
    g[y][16] = 'R';
  }
  return toRows(g);
}

// 架空の虫：頭にティーカップを載せ、片眼鏡をかけた紳士風の虫
function teaTimeBug() {
  const g = symmetric((h) => {
    line(h, 11, 22, 5, 20, 'k');
    line(h, 10, 26, 5, 29, 'k');
    ellipse(h, 15.5, 23, 8, 7, 'b');
    put(h, 11, 21, 'w');
    put(h, 12, 25, 'w');
    put(h, 9, 24, 'w');
    ellipse(h, 15.5, 16, 5, 3.6, 'f');
    put(h, 13, 15, 'k');
    line(h, 14, 18, 15, 18, 'd');
  });
  // 片眼鏡（右目のまわり）
  for (const [x, y] of [[17, 14], [18, 14], [19, 15], [19, 16], [18, 17], [17, 17], [16, 16], [16, 15]]) put(g, x, y, 'y');
  put(g, 18, 15, 'k');
  // ティーカップ（頭の上）と湯気
  rect(g, 11, 7, 10, 5, 'w');
  rect(g, 12, 7, 8, 2, 'o');
  put(g, 21, 8, 's');
  put(g, 22, 9, 's');
  put(g, 21, 10, 's');
  rect(g, 9, 12, 14, 1, 's');
  for (const [x, y] of [[14, 5], [15, 4], [14, 3], [15, 2], [17, 5], [18, 4], [17, 3]]) put(g, x, y, 's');
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

const BASE_INSECTS = [
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
  // ---- ヨーロッパ（テスト段階の5種）。和名は、権威ある出典で確認できていない（下記の注）。
  // 大きさは英語版Wikipedia（2026-09-25確認、確度B）：ヨーロッパコフキコガネ25〜30mm、キンイロハナムグリ約20mm、
  // ヨーロッパサイカブト20〜42mm（最大47mm）、ヨーロッパミヤマクワガタ オス最大7.5cm・メス3〜5cm
  {
    id: 'eu_kofuki',
    region: 'europe',
    name: 'ヨーロッパコフキコガネ',
    rarity: 'common',
    price: 10,
    sizeText: '約2.5〜3cm',
    description:
      '4月の終わりから5月に現れるので、英語では「5月の虫」と呼ばれる。オークの葉が大好物で、夕暮れには木のまわりに大集合する。毎年、ちゃんと出勤してくる。',
    grid: cockchafer(),
  },
  {
    id: 'eu_kinirohanamuguri',
    region: 'europe',
    name: 'キンイロハナムグリ',
    rarity: 'common',
    price: 12,
    sizeText: '約2cm',
    description:
      '金属みたいにピカピカの緑色。花粉と蜜が好きで、バラの花の常連。はねを閉じたまま飛ぶという、不思議な特技がある。',
    grid: roseChafer(),
  },
  {
    id: 'eu_saikabuto',
    region: 'europe',
    name: 'ヨーロッパサイカブト',
    rarity: 'rare',
    price: 40,
    sizeText: '約2〜4.2cm（最大4.7cm）',
    description:
      '大人になると、何も食べない。幼虫のころの貯金だけで生きる、節約の達人。オスの長い角がトレードマークで、夜は灯りに飛んでくる。',
    grid: rhinoBeetle({ body: 'R', edge: 'n', fork: false }),
  },
  {
    id: 'eu_miyama',
    region: 'europe',
    name: 'ヨーロッパミヤマクワガタ',
    rarity: 'epic',
    price: 150,
    sizeText: 'オス 最大7.5cm／メス 3〜5cm',
    description:
      'ヨーロッパで一番大きい甲虫。鹿の角のような大あごが自慢。数が減っていて、IUCNのレッドリストでは準絶滅危惧とされている。森の主には、そっと道をゆずろう。',
    grid: stagBeetle({
      body: 'B',
      edge: 'n',
      seam: 'n',
      legs: 'n',
      jaw: 'B',
      jawPath: [[12, 7], [8, 5], [6, 2], [9, 0]],
      tooth: [[9, 3, 2, 2], [8, 1, 2, 1]],
    }),
  },
  {
    id: 'eu_teatime',
    region: 'europe',
    name: 'ティータイムシ',
    rarity: 'unique',
    price: 120,
    sizeText: '約2.5cm（架空の虫）',
    description:
      '【架空の虫】午後3時ぴったりに、頭のティーカップでお茶を始める紳士。時間におくれた虫には、ほんの少しだけ厳しい。',
    grid: teaTimeBug(),
  },
  // ---- 南米（テスト段階の5種）。大きさは日本語版Wikipedia（2026-09-25確認、確度B）
  {
    id: 'am_hakiri',
    region: 'amazon',
    name: 'ハキリアリ',
    rarity: 'common',
    price: 10,
    sizeText: '約0.3〜2cm（役割によって大きさが違う）',
    description:
      '切り取った葉っぱを、頭の上にかざして行進する。でも、葉っぱは食べない。巣の中で葉にキノコを育て、そのキノコが晩ごはん。ちゃんと農家なのだ。',
    grid: leafcutterAnt(),
  },
  {
    id: 'am_morpho',
    region: 'amazon',
    name: 'モルフォチョウ',
    rarity: 'common',
    price: 12,
    sizeText: '種によって違う（大きな種は、はねを広げて約20cm）',
    description:
      'あの青は、絵の具ではなく、はねの鱗粉が光をはね返してつくる「構造色」。虫が自分でおしゃれをしているわけではない……はず。',
    grid: morphoButterfly(),
  },
  {
    id: 'am_actaeon',
    region: 'amazon',
    name: 'アクティオンゾウカブト',
    rarity: 'rare',
    price: 40,
    sizeText: 'オス 7.5〜13.3cm／メス 5〜8.5cm',
    description:
      '真っ黒でつやのない、アマゾンの重戦車。頭と胸に、太い角が平行にのびる。角の押し合いになったら、たぶん勝ち目はない。',
    grid: actaeonBeetle(),
  },
  {
    id: 'am_hercules',
    region: 'amazon',
    name: 'ヘラクレスオオカブト',
    rarity: 'epic',
    price: 150,
    sizeText: 'オス 平均約11.5cm（最大18cm以上・角を含む）／メス 平均約6cm',
    description:
      '甲虫の中でも、角が世界一長いとされる。はねの色は湿度で変わり、しめっていると黒く、かわくと黄色くなる。気分屋ではなく、天気屋。',
    grid: herculesBeetle(),
  },
  {
    id: 'am_hammock',
    region: 'amazon',
    name: 'ハンモックムシ',
    rarity: 'unique',
    price: 120,
    sizeText: '約3cm（架空の虫）',
    description:
      '【架空の虫】木の枝にハンモックを張って、昼寝ばかりしている。雨がふっても「これも自然のシャワー」と言って動かない。',
    grid: hammockBug(),
  },
  // ---- 東南アジア（テスト段階の5種）
  {
    id: 'sea_tsumugi',
    region: 'sea',
    name: 'ツムギアリ',
    rarity: 'common',
    price: 10,
    sizeText: '約0.7〜1.2cm',
    description:
      '葉っぱ同士を、仲間の幼虫が出す糸でぬい合わせて巣をつくる。全員で、大きな縫い物をしているようなもの。',
    grid: weaverAnt(),
  },
  {
    id: 'sea_hanakamakiri',
    region: 'sea',
    name: 'ハナカマキリ',
    rarity: 'common',
    price: 12,
    sizeText: 'メス 約7cm／オス 約3.5cm',
    description:
      '熱帯雨林で、ランの花びらそっくりに変身する。メスは約7cmなのに、オスは約3.5cmと、かなり小柄。カマキリ界の、体格差カップル。',
    grid: orchidMantis(),
  },
  {
    id: 'sea_atlas',
    region: 'sea',
    name: 'アトラスオオカブト',
    rarity: 'rare',
    price: 40,
    sizeText: 'オス 約5〜11cm（亜種によって違う）',
    description:
      '東南アジアの低地にすむ、大型のカブトムシ。大きさは亜種でかなり差がある。角の先が、ヤリのようにふくらんでいるのが目印。',
    grid: atlasBeetle(),
  },
  {
    id: 'sea_giraffa',
    region: 'sea',
    name: 'ギラファノコギリクワガタ',
    rarity: 'epic',
    price: 150,
    sizeText: 'オス 4.5〜12.2cm／メス 3.1〜5.6cm',
    description:
      '名前の「ギラファ」は、キリンのこと。細長い大あごと体を、キリンに見立てた。首（大あご）が長すぎて、ときどき自分でも持て余している。',
    grid: giraffeStag(),
  },
  {
    id: 'sea_karaoke',
    region: 'sea',
    name: 'カラオケムシ',
    rarity: 'unique',
    price: 120,
    sizeText: '約3cm（架空の虫）',
    description:
      '【架空の虫】夕方になると、ジャングルにマイクを持って現れる。十八番は、蚊の羽音のものまね。',
    grid: karaokeBug(),
  },
  // ---- アフリカ（テスト段階の5種）
  {
    id: 'af_scarab',
    region: 'africa',
    name: 'ヒジリタマオシコガネ',
    rarity: 'common',
    price: 10,
    sizeText: '約1.9〜4cm',
    description:
      '動物のふんを丸めて転がす、いわゆる「フンコロガシ」。古代エジプトでは、太陽をころがす神様の象徴として、神聖な虫あつかいされた。転がしているのは、ふんだけれど。',
    grid: scarabBeetle(),
  },
  {
    id: 'af_locust',
    region: 'africa',
    name: 'サバクトビバッタ',
    rarity: 'common',
    price: 12,
    sizeText: 'オス 4〜5cm／メス 5〜6cm',
    description:
      '毎日、自分の体重と同じ量の緑の植物を食べる、食いしん坊。大群になると体の色が黄色や黒に変わり、1日に100〜200km飛ぶこともある。',
    grid: desertLocust(),
  },
  {
    id: 'af_madagascar',
    region: 'africa',
    name: 'マダガスカルゴキブリ',
    rarity: 'rare',
    price: 40,
    sizeText: '約5〜7.5cm',
    description:
      'はねはないけれど、「シュー」と音を出せる。体をこすっているのではなく、気門から空気を押し出している。音の出るゴキブリとして、一部で人気。',
    grid: hissingRoach(),
  },
  {
    id: 'af_goliath',
    region: 'africa',
    name: 'ゴライアスオオツノハナムグリ',
    rarity: 'epic',
    price: 150,
    sizeText: 'オス 6.5〜11cm／メス 5〜7.5cm',
    description:
      '世界一重い昆虫とされる、アフリカのハナムグリ。胸には白地に黒のしま模様、頭の角は2本に分かれている。持ち上げると、ずしっと重い。',
    grid: goliathBeetle(),
  },
  {
    id: 'af_baobab',
    region: 'africa',
    name: 'バオバブムシ',
    rarity: 'unique',
    price: 120,
    sizeText: '約3.5cm（架空の虫）',
    description:
      '【架空の虫】バオバブの木にそっくりな体型。お腹に水をためるのが自慢で、「これは非常用」と言いながら、毎日飲んでしまう。',
    grid: baobabBug(),
  },
];

// 最終形の追加分（lib/insectsMore.js）を合わせた、全虫のデータ
export const INSECTS = [...BASE_INSECTS, ...EXTRA_INSECTS];

// 地域ごとの道具（2026-09-25、ユーザー指定：「地域によってたたくためのものを変える。地域特性にあっていれば、
// 本来の使用目的が『たたく』でなくてもOK。グレードは地域で隔てる（日本で最大でも、他の地域では購入していなければレベル1）」）。
// luck は、レア虫の出やすさの補正（5段階目だけ。レア×2・エピック×3・ユニーク×6）。power は1回のクリックの効き方（倍率）、rarities は、その等級で出るようになる虫のレア度、color は、絵の道具の頭の色
const ALL_RARITIES = ['common', 'rare', 'epic', 'unique'];

// currency：その地域の通貨の単位（2026-09-25、ユーザー指定：「コインを、各地域の主要なお金の単位にして」）。
// 日本以外は、地域が複数の国にまたがるため、代表的な国の通貨を仮に置いている（未決。実装前に決め直す）
export const REGIONS = [
  {
    id: 'japan',
    name: '日本',
    currency: '円',
    tree: 'クヌギ',
    // 木と服装：基本＋ショップで買える1種ずつ（cost は、その地域の通貨。提案値）
    trees: [
      { id: 'kunugi', name: 'クヌギ', kind: 'kunugi', variant: null, cost: 0 },
      { id: 'kunugi_autumn', name: '秋のクヌギ（紅葉）', kind: 'kunugi', variant: 'autumn', cost: 200 },
    ],
    outfits: [
      { id: 'japan', name: '夏の採集スタイル', key: 'japan', cost: 0 },
      { id: 'japan2', name: '探検家スタイル', key: 'japan2', cost: 200 },
    ],
    scene: { sky: '#8fd0ec', sky2: '#a5dcf2', hill: '#7fb069', ground: '#5c8a4a', ground2: '#4d7a3d', sun: '#f6e27a' },
    available: true,
    tools: [
      { name: '木の棒', power: 1, cost: 0, rarities: ALL_RARITIES.slice(0, 1), color: 'h', shape: 'hammer' },
      { name: '木槌（きづち）', power: 1.3, cost: 60, rarities: ALL_RARITIES.slice(0, 2), color: 'B', shape: 'hammer' },
      { name: '鉄の金槌', power: 1.7, cost: 250, rarities: ALL_RARITIES.slice(0, 3), color: 's', shape: 'hammer' },
      { name: '打ち出の小槌', power: 2.2, cost: 800, rarities: ALL_RARITIES, color: 'y', shape: 'hammer' },
      { name: '七福神の大槌', power: 2.6, cost: 1500, rarities: ALL_RARITIES, luck: 1, color: 'v', shape: 'hammer' },
    ],
    // 世界地図上の位置（横・縦、%）
    pin: { x: 91.5, y: 37 },
  },
  {
    id: 'sea',
    name: '東南アジア',
    currency: 'バーツ', // 仮（地域が複数の国にまたがるため、タイの通貨を置いている。未決）
    tree: '熱帯雨林の巨木',
    scene: { sky: '#8fd9d0', sky2: '#a6e4dc', hill: '#4f9a5e', ground: '#4c8a3f', ground2: '#3d7532', sun: '#ffe08a' },
    available: true,
    trees: [
      { id: 'rainforest', name: '熱帯雨林の巨木', kind: 'rainforest', variant: null, cost: 0 },
      { id: 'rainforest_night', name: '夜の雨林（ホタルの光）', kind: 'rainforest', variant: 'night', cost: 200 },
    ],
    outfits: [
      { id: 'sea', name: 'ジャングル採集スタイル', key: 'sea', cost: 0 },
      { id: 'sea2', name: '涼しい麻シャツスタイル', key: 'sea2', cost: 200 },
    ],
    // 道具：竹の棒 → 木の杵（米をつく道具。本来の用途は「つく」） → 鉄のパラン（マレー地域のなた） → 黄金の杵
    tools: [
      { name: '竹の棒', power: 1, cost: 0, rarities: ALL_RARITIES.slice(0, 1), color: 'h', shape: 'stick' },
      { name: '木の杵（きね）', power: 1.3, cost: 60, rarities: ALL_RARITIES.slice(0, 2), color: 'r', shape: 'hammer' },
      { name: '鉄のパラン（なた）', power: 1.7, cost: 250, rarities: ALL_RARITIES.slice(0, 3), color: 'e', shape: 'blade' },
      { name: '黄金の杵', power: 2.2, cost: 800, rarities: ALL_RARITIES, color: 'y', shape: 'hammer' },
      { name: '大蛇の黄金杵', power: 2.6, cost: 1500, rarities: ALL_RARITIES, luck: 1, color: 'v', shape: 'hammer' },
    ],
    pin: { x: 79, y: 62 },
  },
  {
    id: 'amazon',
    name: '南米',
    currency: 'レアル', // 仮（地域が複数の国にまたがるため、ブラジルの通貨を置いている。未決）
    tree: 'カポックの巨木',
    scene: { sky: '#9cc9b8', sky2: '#b0d6c8', hill: '#5c9a6a', ground: '#4a7d3f', ground2: '#3c6a34', sun: '#f0e08a' },
    available: true,
    trees: [
      { id: 'ceiba', name: 'カポックの巨木', kind: 'ceiba', variant: null, cost: 0 },
      { id: 'ceiba_bloom', name: '花ざかりのカポック', kind: 'ceiba', variant: 'bloom', cost: 200 },
    ],
    outfits: [
      { id: 'amazon', name: '熱帯探検スタイル', key: 'amazon', cost: 0 },
      { id: 'amazon2', name: '雨林レンジャースタイル', key: 'amazon2', cost: 200 },
    ],
    // 道具：木の棒 → 石斧 → 鉄のなた → 黄金のなた（黄金は、南米の「エルドラド（黄金郷）」伝説にちなんだ遊び）
    tools: [
      { name: '木の棒', power: 1, cost: 0, rarities: ALL_RARITIES.slice(0, 1), color: 'h', shape: 'stick' },
      { name: '石斧（せきふ）', power: 1.3, cost: 60, rarities: ALL_RARITIES.slice(0, 2), color: 's', shape: 'axe' },
      { name: '鉄のなた', power: 1.7, cost: 250, rarities: ALL_RARITIES.slice(0, 3), color: 'e', shape: 'blade' },
      { name: '黄金のなた', power: 2.2, cost: 800, rarities: ALL_RARITIES, color: 'y', shape: 'blade' },
      { name: '太陽神のなた', power: 2.6, cost: 1500, rarities: ALL_RARITIES, luck: 1, color: 'v', shape: 'blade' },
    ],
    pin: { x: 31, y: 75 },
  },
  {
    id: 'africa',
    name: 'アフリカ',
    currency: 'ランド', // 仮（大陸が多くの国にまたがるため、南アフリカの通貨を置いている。未決）
    tree: 'バオバブ',
    scene: { sky: '#f2d59a', sky2: '#f7e0b0', hill: '#c9a45c', ground: '#b8944a', ground2: '#a07f3a', sun: '#e8623a' },
    available: true,
    trees: [
      { id: 'baobab', name: 'バオバブ', kind: 'baobab', variant: null, cost: 0 },
      { id: 'baobab_dry', name: '乾季のバオバブ（葉がない）', kind: 'baobab', variant: 'leafless', cost: 200 },
    ],
    outfits: [
      { id: 'africa', name: 'サバンナ採集スタイル', key: 'africa', cost: 0 },
      { id: 'africa2', name: '砂ぼこりよけスタイル', key: 'africa2', cost: 200 },
    ],
    // 道具：木の棒 → 太鼓のバチ（本来の用途は「太鼓を打つ」） → ノブケリー（南部アフリカのこぶ杖） → 黄金のノブケリー
    tools: [
      { name: '木の棒', power: 1, cost: 0, rarities: ALL_RARITIES.slice(0, 1), color: 'h', shape: 'stick' },
      { name: '太鼓のバチ', power: 1.3, cost: 60, rarities: ALL_RARITIES.slice(0, 2), color: 'B', shape: 'hammer' },
      { name: 'ノブケリー（こぶ杖）', power: 1.7, cost: 250, rarities: ALL_RARITIES.slice(0, 3), color: 'e', shape: 'hammer' },
      { name: '黄金のノブケリー', power: 2.2, cost: 800, rarities: ALL_RARITIES, color: 'y', shape: 'hammer' },
      { name: '王のノブケリー', power: 2.6, cost: 1500, rarities: ALL_RARITIES, luck: 1, color: 'v', shape: 'hammer' },
    ],
    pin: { x: 52, y: 62 },
  },
  {
    id: 'europe',
    name: 'ヨーロッパ',
    currency: 'ユーロ',
    tree: 'オーク',
    trees: [
      { id: 'oak', name: 'オーク', kind: 'oak', variant: null, cost: 0 },
      { id: 'oak_winter', name: '冬のオーク（雪）', kind: 'oak', variant: 'winter', cost: 200 },
    ],
    outfits: [
      { id: 'europe', name: '森の採集スタイル', key: 'europe', cost: 0 },
      { id: 'europe2', name: '雨の日スタイル', key: 'europe2', cost: 200 },
    ],
    scene: { sky: '#a9c8dc', sky2: '#bcd6e6', hill: '#8bb07a', ground: '#6a9450', ground2: '#587f42', sun: '#f0e6b0' },
    available: true,
    // 道具：木の棒 → 石の手斧 → 鉄の斧 → 金の斧（童話「金の斧」）。斧は、本来の用途が木を切ること。等級は日本とは別
    tools: [
      { name: '木の棒', power: 1, cost: 0, rarities: ALL_RARITIES.slice(0, 1), color: 'h', shape: 'stick' },
      { name: '石の手斧', power: 1.3, cost: 60, rarities: ALL_RARITIES.slice(0, 2), color: 's', shape: 'axe' },
      { name: '鉄の斧', power: 1.7, cost: 250, rarities: ALL_RARITIES.slice(0, 3), color: 'e', shape: 'axe' },
      { name: '金の斧', power: 2.2, cost: 800, rarities: ALL_RARITIES, color: 'y', shape: 'axe' },
      { name: '女神の黄金斧', power: 2.6, cost: 1500, rarities: ALL_RARITIES, luck: 1, color: 'v', shape: 'axe' },
    ], pin: { x: 52, y: 29 } },
  {
    // 月：全5地域の図鑑をそろえて、エンディングを見たあとに、行き先に出る（ユーザー指定、2026-09-26）。
    // 虫は3種だけ（すべて架空のユニーク）。道具は3段階で、どれも、ユニークが出る
    id: 'moon',
    name: '月',
    secret: true,
    currency: 'ルナ', // 月の通貨（ゲーム内の架空の単位）
    tree: '木',
    trees: [
      { id: 'lunar_crystal', name: '水晶の月の木', kind: 'lunar', variant: 'crystal', cost: 0 },
      { id: 'lunar_gold', name: '黄金の月の木', kind: 'lunar', variant: 'gold', cost: 200 },
    ],
    outfits: [
      { id: 'moon', name: '白い宇宙服', key: 'moon', cost: 0 },
      { id: 'moon2', name: 'オレンジの宇宙服', key: 'moon2', cost: 200 },
    ],
    scene: { sky: '#101838', sky2: '#18224a', hill: '#6b6f8a', ground: '#9599ad', ground2: '#7d8196', sun: '#4a8fd0', stars: true },
    available: true,
    // 月の道具は、どれも最高の威力（×2.6）で、買わずに自由に選べる。オーラは無し（ユーザー指定）。見た目はSF
    freeTools: true,
    tools: [
      { name: 'フォトンブレード', power: 2.6, cost: 0, rarities: ['unique'], color: 'l', shape: 'saber' },
      { name: 'ソーラーブレード', power: 2.6, cost: 0, rarities: ['unique'], color: 'o', shape: 'saber' },
      { name: 'プラズマハンマー', power: 2.6, cost: 0, rarities: ['unique'], color: 'v', shape: 'plasma' },
      { name: 'レールロッド', power: 2.6, cost: 0, rarities: ['unique'], color: 'q', shape: 'rail' },
    ],
    celebration: {
      title: '月の図鑑コンプリート！',
      message: '月の虫を、5種ぜんぶ集めました！\nうさぎも、餅つきの手を止めて拍手しています。',
    },
    pin: { x: 40, y: 8 },
  },
];

// 隠し地域（月）を除いた、ふつうの5地域。エンディングの条件・場面・パレードは、こちらだけを対象にする
export const MAIN_REGIONS = REGIONS.filter((r) => !r.secret);

export function getRegion(id) {
  return REGIONS.find((r) => r.id === id);
}

export function getInsect(id) {
  return INSECTS.find((i) => i.id === id);
}

export function insectsOfRegion(regionId) {
  return INSECTS.filter((i) => i.region === regionId).sort((a, b) => RARITY[a.rarity].order - RARITY[b.rarity].order);
}
