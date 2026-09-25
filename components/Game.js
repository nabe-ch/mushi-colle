'use client';

// ゲーム全体：タイトル → 世界地図 → 木を叩く、と、図鑑・ハンマーの購入
import { useEffect, useState } from 'react';
import { REGIONS } from '@/lib/insects';
import { HAMMERS, applyDrops, rollDrops, loadSave, persistSave } from '@/lib/game';
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
  const hammer = HAMMERS[save.hammer];
  const nextHammer = HAMMERS[save.hammer + 1] || null;

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  function handleRoll(level) {
    const drops = rollDrops(regionId, level, save.hammer);
    const applied = applyDrops(save, drops);
    setSave(applied.save);
    return applied.results;
  }

  function buyHammer() {
    if (!nextHammer || save.coins < nextHammer.cost) return;
    setSave({ ...save, coins: save.coins - nextHammer.cost, hammer: nextHammer.id });
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
        <p className="coins">コイン {save.coins}</p>
        <div className="topbar-buttons">
          <button type="button" className="btn btn-small" onClick={() => setShopOpen(true)}>
            ハンマー
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
          <p className="section-title">行き先をえらんでね（{hammer.name}）</p>
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
          hammerId={save.hammer}
          onRoll={handleRoll}
          onExit={() => setScreen('map')}
        />
      )}

      {zukanOpen && <ZukanScreen save={save} onSeen={markSeen} onClose={() => setZukanOpen(false)} />}

      {shopOpen && (
        <Modal onClose={() => setShopOpen(false)}>
          <h2 className="modal-title">ハンマー</h2>
          <p className="modal-hint">いいハンマーほど、少ない連打で強くたたけます。新しいハンマーで、めずらしい虫も出るようになります。</p>
          <ul className="shop-list">
            {HAMMERS.map((h) => (
              <li key={h.id} className={`shop-item${h.id === save.hammer ? ' shop-item-current' : ''}`}>
                <div>
                  <p className="shop-name">
                    {h.name}
                    {h.id === save.hammer && <span className="shop-tag">使用中</span>}
                    {h.id < save.hammer && <span className="shop-tag shop-tag-old">持っている</span>}
                  </p>
                  <p className="shop-desc">威力 ×{h.power}</p>
                </div>
                {h.id === save.hammer + 1 && (
                  <button type="button" className="btn btn-small" disabled={save.coins < h.cost} onClick={buyHammer}>
                    {h.cost}コインで買う
                  </button>
                )}
                {h.id > save.hammer + 1 && <span className="shop-locked">{h.cost}コイン</span>}
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}
