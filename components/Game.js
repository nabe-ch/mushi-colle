'use client';

// ゲーム全体：タイトル → 世界地図 → 木を叩く、と、図鑑・道具の購入（道具は地域ごとに別）
import { useEffect, useState } from 'react';
import { REGIONS } from '@/lib/insects';
import {
  applyDrops,
  rollDrops,
  loadSave,
  persistSave,
  toolsOf,
  toolLevelOf,
  currentTool,
  buyNextTool,
  walletOf,
  formatMoney,
} from '@/lib/game';
import { startBgm, setMuted, isMuted, playTap, playBuy } from '@/lib/sound';
import WorldMap from './WorldMap';
import HitScene from './HitScene';
import ZukanScreen from './ZukanScreen';
import Modal from './Modal';

export default function Game() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState('title'); // title | map | hit
  const [regionId, setRegionId] = useState(null);
  const [zukanOpen, setZukanOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted);

  useEffect(() => {
    persistSave(save);
  }, [save]);

  useEffect(() => {
    startBgm();
  }, []);

  // ボタンをタップしたときの音（全ボタン共通）。キーボード操作（Enter/Space）由来のクリックは detail が 0
  useEffect(() => {
    function handleClick(e) {
      if (e.target.closest('button')) playTap();
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const region = REGIONS.find((r) => r.id === regionId);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  function handleRoll(level) {
    const drops = rollDrops(regionId, level, toolLevelOf(save, regionId));
    const applied = applyDrops(save, drops, regionId);
    setSave(applied.save);
    return applied.results;
  }

  function buyTool(id) {
    const next = buyNextTool(save, id);
    if (!next) return;
    setSave(next);
    playBuy();
  }

  function markSeen(id) {
    setSave((prev) => (prev.newIds.includes(id) ? { ...prev, newIds: prev.newIds.filter((n) => n !== id) } : prev));
  }

  if (screen === 'title') {
    return (
      <div className="title-screen">
        <h1 className="title-logo">むしコレ</h1>
        <p className="title-sub">～世界中のピクセルむしコレクション～</p>
        <p className="title-lead">世界の木をたたいて、虫をあつめよう。</p>
        <button type="button" className="btn btn-big" onClick={() => setScreen('map')}>
          はじめる
        </button>
      </div>
    );
  }

  return (
    <div className="game">
      <div className="topbar">
        <p className="coins">
          {screen === 'hit' && region
            ? formatMoney(walletOf(save, region.id), region.id)
            : REGIONS.filter((r) => r.available)
                .map((r) => `${r.name} ${formatMoney(walletOf(save, r.id), r.id)}`)
                .join('　')}
        </p>
        <div className="topbar-buttons">
          <button type="button" className="btn btn-small" onClick={() => setShopOpen(true)}>
            道具
          </button>
          <button type="button" className="btn btn-small" onClick={() => setZukanOpen(true)}>
            図鑑{save.newIds.length > 0 && <span className="new-dot">{save.newIds.length}</span>}
          </button>
          <button type="button" className="btn btn-small" onClick={toggleMute} aria-label={muted ? '音を鳴らす' : '音を消す'}>
            {muted ? '音OFF' : '音ON'}
          </button>
        </div>
      </div>

      {screen === 'map' && (
        <>
          <p className="section-title">行き先をえらんでね</p>
          <WorldMap
            onSelect={(id) => {
              setRegionId(id);
              setScreen('hit');
            }}
          />
        </>
      )}

      {screen === 'hit' && region && (
        <HitScene
          key={region.id}
          regionLabel={region.name}
          treeLabel={region.tree}
          currency={region.currency}
          tool={currentTool(save, region.id)}
          onRoll={handleRoll}
          onExit={() => setScreen('map')}
        />
      )}

      {zukanOpen && <ZukanScreen save={save} onSeen={markSeen} onClose={() => setZukanOpen(false)} />}

      {shopOpen && (
        <Modal onClose={() => setShopOpen(false)}>
          <h2 className="modal-title">道具</h2>
          <p className="modal-hint">
            道具とお金は、地域ごとに別です。いい道具ほど、少ない連打で強くたたけて、めずらしい虫も出るようになります。ほかの地域の道具の等級とお金は、引き継がれません。
          </p>
          {REGIONS.filter((r) => r.available).map((r) => {
            const level = toolLevelOf(save, r.id);
            return (
              <section key={r.id} className="shop-region">
                <p className="shop-region-title">
                  {r.name}（所持金 {formatMoney(walletOf(save, r.id), r.id)}）
                </p>
                <ul className="shop-list">
                  {toolsOf(r.id).map((t, i) => (
                    <li key={t.name} className={`shop-item${i === level ? ' shop-item-current' : ''}`}>
                      <div>
                        <p className="shop-name">
                          {t.name}
                          {i === level && <span className="shop-tag">使用中</span>}
                          {i < level && <span className="shop-tag shop-tag-old">持っている</span>}
                        </p>
                        <p className="shop-desc">威力 ×{t.power}</p>
                      </div>
                      {i === level + 1 && (
                        <button type="button" className="btn btn-small" disabled={walletOf(save, r.id) < t.cost} onClick={() => buyTool(r.id)}>
                          {formatMoney(t.cost, r.id)}で買う
                        </button>
                      )}
                      {i > level + 1 && <span className="shop-locked">{formatMoney(t.cost, r.id)}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </Modal>
      )}
    </div>
  );
}
