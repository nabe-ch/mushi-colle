'use client';

// ゲーム全体：タイトル → 世界地図 → 木を叩く、と、図鑑・道具の購入（道具は地域ごとに別）
import { useEffect, useState } from 'react';
import { REGIONS, MAIN_REGIONS } from '@/lib/insects';
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
  createInitialSave,
  isRegionComplete,
  cosmeticItems,
  cosmeticOf,
  currentCosmetic,
  buyCosmetic,
  selectCosmetic,
} from '@/lib/game';
import { startBgm, setMuted, isMuted, playTap, playBuy, playMoonAppear } from '@/lib/sound';
import WorldMap from './WorldMap';
import HitScene from './HitScene';
import ZukanScreen from './ZukanScreen';
import Modal from './Modal';
import TitleScreen from './TitleScreen';
import SaveDataModal from './SaveDataModal';
import EndingMovie from './EndingMovie';

export default function Game() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState('title'); // title | map | hit
  const [regionId, setRegionId] = useState(null);
  const [zukanOpen, setZukanOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted);
  const [saveDataOpen, setSaveDataOpen] = useState(false); // セーブデータ（バックアップ）の画面
  const [resetOpen, setResetOpen] = useState(false); // 初期化の確認画面
  const [endingPending, setEndingPending] = useState(false); // 全地域コンプリート：最後の地域のお祝いのあとに、エンディングを流す
  const [moonAnnounce, setMoonAnnounce] = useState(false); // エンディングのあと、月が現れたお知らせ
  const [celebrateId, setCelebrateId] = useState(null); // 図鑑コンプリートのお祝いを出す地域（最後の結果カードのあとに表示）

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
    // この捕獲で、その地域の図鑑がそろったら、お祝いを予約する
    if (!isRegionComplete(save, regionId) && isRegionComplete(applied.save, regionId)) {
      setCelebrateId(regionId);
      // 全地域がそろったなら、お祝いのあとにエンディングムービー（ユーザー指定）
      if (!region.secret && MAIN_REGIONS.every((r) => isRegionComplete(applied.save, r.id))) setEndingPending(true);
    }
    return applied.results;
  }

  function buyTool(id) {
    const next = buyNextTool(save, id);
    if (!next) return;
    setSave(next);
    playBuy();
  }

  function buyOrSelect(type, index) {
    const cur = cosmeticOf(save, regionId, type);
    const next = cur.owned.includes(index)
      ? selectCosmetic(save, regionId, type, index)
      : buyCosmetic(save, regionId, type, index);
    if (!next) return;
    setSave(next);
    if (!cur.owned.includes(index)) playBuy();
  }

  function markSeen(id) {
    setSave((prev) => (prev.newIds.includes(id) ? { ...prev, newIds: prev.newIds.filter((n) => n !== id) } : prev));
  }

  if (screen === 'title') {
    return (
      <>
        <TitleScreen
          dex={save.dex}
          onStart={() => setScreen('map')}
          onOpenSaveData={() => setSaveDataOpen(true)}
          onOpenReset={() => setResetOpen(true)}
        />
        {saveDataOpen && (
          <SaveDataModal save={save} onImport={(loaded) => setSave(loaded)} onClose={() => setSaveDataOpen(false)} />
        )}
        {resetOpen && (
          <Modal onClose={() => setResetOpen(false)}>
            <h2 className="modal-title">初期化の確認</h2>
            <p className="confirm-message">
              図鑑（集めた虫 {Object.keys(save.dex).length}種）・お金・道具・木・服装など、すべてのデータが消えて、最初の状態に戻ります。
              <br />
              この操作は、元に戻せません。本当に初期化しますか？
            </p>
            <p className="modal-hint">大切なデータは、先に「セーブデータ」でバックアップしておくと安心です。</p>
            <div className="confirm-buttons">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setSave(createInitialSave());
                  setCelebrateId(null);
                  setResetOpen(false);
                }}
              >
                初期化する
              </button>
              <button type="button" className="btn btn-sub" onClick={() => setResetOpen(false)}>
                やめる
              </button>
            </div>
          </Modal>
        )}
      </>
    );
  }

  if (screen === 'ending') {
    return (
      <EndingMovie
        save={save}
        onClose={() => {
          // 初めてエンディングを見終わったとき（スキップも含む）、行き先に「月」が現れる
          if (!save.endingSeen) {
            setSave((prev) => ({ ...prev, endingSeen: true }));
            setMoonAnnounce(true);
            playMoonAppear();
          }
          setScreen('map');
        }}
      />
    );
  }

  const allComplete = MAIN_REGIONS.every((r) => isRegionComplete(save, r.id));
  const visibleRegions = REGIONS.filter((r) => !r.secret || save.endingSeen);

  return (
    <div className="game">
      <div className="topbar">
        {/* お金は、地域の画面（木をたたく場面）だけに表示する。行き先の画面には出さない（ユーザー指定） */}
        <div className="topbar-left">
          {screen === 'map' && (
            <button type="button" className="btn btn-small btn-sub" onClick={() => setScreen('title')}>
              タイトルへ
            </button>
          )}
          {screen === 'hit' && (
            <button type="button" className="btn btn-small btn-sub" onClick={() => setScreen('map')}>
              行き先へ
            </button>
          )}
          <p className="coins">{screen === 'hit' && region ? formatMoney(walletOf(save, region.id), region.id) : ''}</p>
        </div>
        <div className="topbar-buttons">
          {screen === 'hit' && (
            <button type="button" className="btn btn-small" onClick={() => setShopOpen(true)}>
              ショップ
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
            regions={visibleRegions}
            appearing={moonAnnounce ? 'moon' : null}
            completed={visibleRegions.filter((r) => isRegionComplete(save, r.id)).map((r) => r.id)}
            onSelect={(id) => {
              setRegionId(id);
              setScreen('hit');
            }}
          />
          {allComplete && (
            <button type="button" className="btn btn-sub ending-replay" onClick={() => setScreen('ending')}>
              エンディングを見る
            </button>
          )}
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
          treeSkin={currentCosmetic(save, region.id, 'tree')}
          outfitKey={currentCosmetic(save, region.id, 'outfit').key}
          celebrateRegion={celebrateId === region.id ? region : null}
          onCelebrated={() => {
            setCelebrateId(null);
            if (endingPending) {
              setEndingPending(false);
              setScreen('ending');
            }
          }}
          onRoll={handleRoll}
          onExit={() => setScreen('map')}
        />
      )}

      {moonAnnounce && screen === 'map' && (
        <div className="moon-announce" role="dialog">
          <div className="moon-announce-card">
            <div className="moon-announce-moon" />
            <p className="moon-announce-title">月への道が、ひらけた！</p>
            <p className="moon-announce-text">
              世界地図の夜空に、「月」が現れた。
              <br />
              月には、ここでしか会えない、ユニークな虫が3種いるらしい…！
            </p>
            <button type="button" className="btn" onClick={() => setMoonAnnounce(false)}>
              月へ向かう準備をする
            </button>
          </div>
        </div>
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
          <h2 className="modal-title">ショップ</h2>
          <p className="modal-hint">
            いい道具ほど、少ない連打で強くたたけて、めずらしい虫も出るようになります。木や服装は、見た目だけが変わります。道具・木・服装・お金は地域ごとに別で、ほかの地域には引き継がれません。
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
                        <p className="shop-desc">威力 ×{t.power}{t.luck ? '・レア虫が出やすい' : ''}</p>
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
          {[
            { type: 'tree', title: '木' },
            { type: 'outfit', title: '服装' },
          ].map(({ type, title }) => {
            const cur = cosmeticOf(save, region.id, type);
            return (
              <section key={type} className="shop-region">
                <p className="shop-region-title">{title}</p>
                <ul className="shop-list">
                  {cosmeticItems(region.id, type).map((item, i) => (
                    <li key={item.id} className={`shop-item${i === cur.selected ? ' shop-item-current' : ''}`}>
                      <p className="shop-name">
                        {item.name}
                        {i === cur.selected && <span className="shop-tag">使用中</span>}
                        {i !== cur.selected && cur.owned.includes(i) && <span className="shop-tag shop-tag-old">持っている</span>}
                      </p>
                      {i !== cur.selected && cur.owned.includes(i) && (
                        <button type="button" className="btn btn-small" onClick={() => buyOrSelect(type, i)}>
                          つかう
                        </button>
                      )}
                      {!cur.owned.includes(i) && (
                        <button
                          type="button"
                          className="btn btn-small"
                          disabled={walletOf(save, region.id) < item.cost}
                          onClick={() => buyOrSelect(type, i)}
                        >
                          {formatMoney(item.cost, region.id)}で買う
                        </button>
                      )}
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
