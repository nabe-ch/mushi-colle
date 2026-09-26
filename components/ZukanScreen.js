'use client';

// 図鑑。捕まえた虫だけ絵と名前が見える。未発見は黒いシルエットと「？」。
// タップすると詳細（大きい絵・レア度・名前・大きさ・説明文）。新種は「NEW」を表示し、詳細を見ると消える
import { useEffect, useState } from 'react';
import { REGIONS, INSECTS, RARITY, insectsOfRegion } from '@/lib/insects';
import InsectArt from './InsectArt';
import Modal from './Modal';

// regionId を渡すと、その地域の虫だけを表示する（2026-09-25、ユーザー指定：「図鑑も、その地域のぶんだけ」）。
// 渡さない（地図の画面から開いた）ときは、全地域を表示する
export default function ZukanScreen({ save, regionId, onSeen, onClose }) {
  const [selected, setSelected] = useState(null);
  // 月は、エンディングを見たあとにだけ表示する（ネタバレ防止）
  const regions = regionId ? REGIONS.filter((r) => r.id === regionId) : REGIONS.filter((r) => !r.secret || save.endingSeen);
  const scope = INSECTS.filter((i) => regions.some((r) => r.id === i.region));
  const total = scope.length;
  const got = scope.filter((i) => save.dex[i.id]).length;

  // 詳細で前後に移れる順番＝図鑑の並び（登録済みの虫だけ。未発見は、ネタバレ防止のため飛ばす）
  const browsable = regions.flatMap((r) => insectsOfRegion(r.id)).filter((i) => save.dex[i.id]);
  const pos = selected ? browsable.findIndex((i) => i.id === selected.id) : -1;
  const prev = pos > 0 ? browsable[pos - 1] : null;
  const next = pos >= 0 && pos < browsable.length - 1 ? browsable[pos + 1] : null;

  // キーボードの左右キーでも前後に移れる
  useEffect(() => {
    if (!selected) return undefined;
    function onKey(e) {
      if (e.key === 'ArrowLeft' && prev) open(prev);
      if (e.key === 'ArrowRight' && next) open(next);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function open(insect) {
    setSelected(insect);
    onSeen(insect.id);
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="modal-title">むしコレ図鑑{regionId && `（${regions[0].name}）`}</h2>
      <p className="modal-hint">
        集めた数：{got} / {total}（タップで詳しく見られます）
      </p>
      {regions.map((region) => {
        const list = insectsOfRegion(region.id);
        return (
          <section key={region.id} className="zukan-region">
            <p className="zukan-region-title">{region.name}</p>
            {list.length === 0 ? (
              <p className="zukan-empty">準備中</p>
            ) : (
              <ul className="zukan-list">
                {list.map((insect) => {
                  const found = !!save.dex[insect.id];
                  return (
                    <li key={insect.id}>
                      <button
                        type="button"
                        className={`zukan-card${found ? '' : ' zukan-card-unknown'}`}
                        disabled={!found}
                        onClick={() => open(insect)}
                      >
                        {found && save.newIds.includes(insect.id) && <span className="new-badge">NEW</span>}
                        <InsectArt rows={insect.grid} dot={3} unknown={!found} />
                        <span className="zukan-card-name">{found ? insect.name : '？？？'}</span>
                        {found && (
                          <span className="zukan-card-rarity" style={{ color: RARITY[insect.rarity].color }}>
                            {RARITY[insect.rarity].label}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div className="detail-nav">
            <button type="button" className="detail-arrow" disabled={!prev} onClick={() => open(prev)} aria-label={prev ? '前の虫：' + prev.name : '前の虫はいません'}>
              ◀
            </button>
            <div className="detail-body">
              <div className="detail-art">
                <InsectArt rows={selected.grid} dot={9} />
              </div>
              <p className="detail-rarity" style={{ color: RARITY[selected.rarity].color }}>
                {RARITY[selected.rarity].label}
              </p>
              <h3 className="detail-name">{selected.name}</h3>
              <p className="detail-size">大きさ：{selected.sizeText}</p>
              <p className="detail-desc">{selected.description}</p>
              <p className="detail-count">
                捕まえた回数：{save.dex[selected.id]?.count ?? 0}（{pos + 1} / {browsable.length}）
              </p>
            </div>
            <button type="button" className="detail-arrow" disabled={!next} onClick={() => open(next)} aria-label={next ? '次の虫：' + next.name : '次の虫はいません'}>
              ▶
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
