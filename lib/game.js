// ゲームのルール（叩く強さ・道具・虫の出方・保存）。数値はすべて提案値で、遊んで調整する
import { INSECTS, RARITY, getRegion } from './insects';

export const HIT_SECONDS = 5; // 連打の制限時間（企画書で決定、2026-09-25）
export const MAX_STRENGTH = 5;
const SAVE_KEY = 'mushi-colle-save-v1';

// 道具は地域ごとに別（lib/insects.js の REGIONS.tools）。等級（レベル）も地域ごとに保存する。
// 日本で最大まで買っても、ほかの地域では、買うまで最初の道具（レベル1）から始まる
export function toolsOf(regionId) {
  return getRegion(regionId)?.tools ?? [];
}

export function toolLevelOf(save, regionId) {
  return save.tools?.[regionId] ?? 0;
}

export function currentTool(save, regionId) {
  return toolsOf(regionId)[toolLevelOf(save, regionId)];
}

// 次の等級の道具を買う。買えないときは null
export function buyNextTool(save, regionId) {
  const level = toolLevelOf(save, regionId);
  const next = toolsOf(regionId)[level + 1];
  if (!next || walletOf(save, regionId) < next.cost) return null;
  return {
    ...save,
    wallets: { ...save.wallets, [regionId]: walletOf(save, regionId) - next.cost },
    tools: { ...save.tools, [regionId]: level + 1 },
  };
}

// お金は地域ごとの財布に分ける（2026-09-25。通貨が地域ごとに違うため。日本で稼いだ円は、日本の道具にだけ使える）
export function walletOf(save, regionId) {
  return save.wallets?.[regionId] ?? 0;
}

export function formatMoney(amount, regionId) {
  return `${amount}${getRegion(regionId)?.currency ?? ''}`;
}

// クリック（タップ）の回数と、道具の倍率から、叩く強さ（1〜5）を決める
export function strengthLevel(clicks, tool) {
  const effective = clicks * tool.power;
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

export function rollDrops(regionId, level, toolLevel, rng = Math.random) {
  const allowed = toolsOf(regionId)[toolLevel].rarities;
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
    wallets: {}, // { 地域のID: その地域の通貨での所持金 }
    tools: {}, // { 地域のID: 道具の等級（0が最初の道具）}。地域ごとに別
    dex: {}, // { 虫のID: { count } }
    newIds: [], // 図鑑でまだ見ていない新種のID（「NEW」表示用）
  };
}

// 捕まえた虫を反映する（その地域の通貨を加算し、図鑑に登録する）。results は、1匹ずつの表示用
export function applyDrops(save, insects, regionId) {
  const dex = { ...save.dex };
  const newIds = [...save.newIds];
  let money = walletOf(save, regionId);
  const results = insects.map((insect) => {
    const isNew = !dex[insect.id];
    dex[insect.id] = { count: (dex[insect.id]?.count || 0) + 1 };
    if (isNew) newIds.push(insect.id);
    money += insect.price;
    return { insect, isNew, price: insect.price };
  });
  return { save: { ...save, wallets: { ...save.wallets, [regionId]: money }, dex, newIds }, results };
}

export function loadSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialSave();
    const parsed = JSON.parse(raw);
    if (typeof parsed.coins !== 'number' && typeof parsed.wallets !== 'object') return createInitialSave();
    const merged = { ...createInitialSave(), ...parsed };
    // 通貨を地域別にする前（coins が1つだけ）の保存データは、日本の財布として引き継ぐ
    if (typeof parsed.coins === 'number' && !parsed.wallets) merged.wallets = { japan: parsed.coins };
    delete merged.coins;
    // 道具を地域別にする前（hammer が1つだけ）の保存データは、日本の等級として引き継ぐ
    if (typeof parsed.hammer === 'number' && !parsed.tools) merged.tools = { japan: parsed.hammer };
    delete merged.hammer;
    return merged;
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
