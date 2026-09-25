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
import TitleScreen from './TitleScreen';

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
    return <TitleScreen onStart={() => setScreen('map')} />;
  }

  return (
    <div className="game">
      <div className="topbar">
        {/* お金は、地域の画面（木をたたく場面）だけに表示する。行き先の画面には出さない（ユーザー指定） */}
        <p className="coins">{screen === 'hit' && region ? formatMoney(walletOf(save, region.id), region.id) : ''}</p>
        <div className="topbar-buttons">
          {screen === 'hit' && (
            <button type="button" className="btn btn-small" onClick={() => setShopOpen(true)}>
              道具
            </button>
          )}
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
          <section className="howto">
            <h2 className="howto-title">あそびかた</h2>
            <ol className="howto-list">
              <li>地図で行き先をえらぶと、その地域の木の前に立ちます。</li>
              <li>画面をタップ（クリック）して連打！最初のタップから5秒間で、たくさん押すほど強く木をたたけます。（キーボードは使えません）</li>
              <li>木がゆれて、虫が落ちてきます。強くたたくほど、たくさん、めずらしい虫が出やすくなります。</li>
              <li>捕まえた虫は、その地域のお金になります。お金で、その地域の道具を強くできます。</li>
              <li>強い道具にすると、もっとめずらしい虫が出るようになります。</li>
              <li>虫は図鑑にたまります。全部あつめてコンプリートをめざそう！</li>
            </ol>
            <p className="howto-note">お金と道具は、地域ごとに別です。ほかの地域の道具やお金は使えません。</p>
          </section>
        </>
      )}

      {screen === 'hit' && region && (
        <HitScene
          key={region.id}
          region={region}
          tool={currentTool(save, region.id)}
          onRoll={handleRoll}
          onExit={() => setScreen('map')}
        />
      )}

      {zukanOpen && (
        <ZukanScreen
          save={save}
          regionId={screen === 'hit' ? regionId : null}
          onSeen={markSeen}
          onClose={() => setZukanOpen(false)}
        />
      )}

      {shopOpen && region && (
        <Modal onClose={() => setShopOpen(false)}>
          <h2 className="modal-title">道具</h2>
          <p className="modal-hint">
            いい道具ほど、少ない連打で強くたたけて、めずらしい虫も出るようになります。道具とお金は地域ごとに別で、ほかの地域には引き継がれません。
          </p>
          {[region].map((r) => {
            const level = toolLevelOf(save, r.id);
            return (
              <section key={r.id} className="shop-region">
                <p className="shop-region-title">
                  {r.name}の道具（所持金 {formatMoney(walletOf(save, r.id), r.id)}）
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
