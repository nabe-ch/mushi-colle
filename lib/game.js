// ゲームのルール（叩く強さ・ハンマー・虫の出方・保存）。数値はすべて提案値で、遊んで調整する
import { INSECTS, RARITY } from './insects';

export const HIT_SECONDS = 5; // 連打の制限時間（企画書で決定、2026-09-25）
export const MAX_STRENGTH = 5;
const SAVE_KEY = 'mushi-colle-save-v1';

// ハンマー：power は1回のクリックの効き方（倍率）。unlock は、そのハンマーで出るようになる虫のレア度
export const HAMMERS = [
  { id: 0, name: '木の棒', power: 1, cost: 0, rarities: ['common'] },
  { id: 1, name: '木のハンマー', power: 1.3, cost: 60, rarities: ['common', 'rare'] },
  { id: 2, name: '鉄のハンマー', power: 1.7, cost: 250, rarities: ['common', 'rare', 'epic'] },
  { id: 3, name: '金のハンマー', power: 2.2, cost: 800, rarities: ['common', 'rare', 'epic', 'unique'] },
];

// クリック（タップ）の回数とハンマーの倍率から、叩く強さ（1〜5）を決める
export function strengthLevel(clicks, hammerId) {
  const effective = clicks * HAMMERS[hammerId].power;
  return Math.max(1, Math.min(MAX_STRENGTH, 1 + Math.floor(effective / 9)));
}

function dropCount(level, rng) {
  if (level <= 1) return 1;
  if (level === 2) return rng() < 0.5 ? 1 : 2;
  if (level === 3) return 2;
  if (level === 4) return rng() < 0.5 ? 2 : 3;
  return 3;
}

// 強さが高いほど、レア度の高い虫の重みが増える
function rarityWeight(rarity, level) {
  const bonus = level - 1;
  if (rarity === 'common') return 70;
  if (rarity === 'rare') return 22 * (1 + bonus * 0.6);
  if (rarity === 'epic') return 6 * (1 + bonus * 1.0);
  return 2 * (1 + bonus * 1.0);
}

export function rollDrops(regionId, level, hammerId, rng = Math.random) {
  const allowed = HAMMERS[hammerId].rarities;
  const pool = INSECTS.filter((i) => i.region === regionId && allowed.includes(i.rarity));
  if (pool.length === 0) return [];
  const rarities = [...new Set(pool.map((i) => i.rarity))];
  const results = [];
  const count = dropCount(level, rng);
  for (let n = 0; n < count; n++) {
    const total = rarities.reduce((sum, r) => sum + rarityWeight(r, level), 0);
    let pick = rng() * total;
    let chosen = rarities[0];
    for (const r of rarities) {
      pick -= rarityWeight(r, level);
      if (pick <= 0) {
        chosen = r;
        break;
      }
    }
    const candidates = pool.filter((i) => i.rarity === chosen);
    results.push(candidates[Math.floor(rng() * candidates.length)]);
  }
  return results;
}

export function createInitialSave() {
  return {
    coins: 0,
    hammer: 0,
    dex: {}, // { 虫のID: { count } }
    newIds: [], // 図鑑でまだ見ていない新種のID（「NEW」表示用）
  };
}

// 捕まえた虫を反映する（コインを加算し、図鑑に登録する）。results は、1匹ずつの表示用
export function applyDrops(save, insects) {
  const dex = { ...save.dex };
  const newIds = [...save.newIds];
  let coins = save.coins;
  const results = insects.map((insect) => {
    const isNew = !dex[insect.id];
    dex[insect.id] = { count: (dex[insect.id]?.count || 0) + 1 };
    if (isNew) newIds.push(insect.id);
    coins += insect.price;
    return { insect, isNew, price: insect.price };
  });
  return { save: { ...save, coins, dex, newIds }, results };
}

export function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialSave();
    const parsed = JSON.parse(raw);
    if (typeof parsed.coins !== 'number') return createInitialSave();
    return { ...createInitialSave(), ...parsed };
  } catch {
    return createInitialSave();
  }
}

export function persistSave(save) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // 保存に失敗しても（プライベートモード等）ゲームは続行する
  }
}

export function rarityInfo(id) {
  return RARITY[id];
}
