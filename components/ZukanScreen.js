'use client';

// 図鑑。捕まえた虫だけ絵と名前が見える。未発見は黒いシルエットと「？」。
// タップすると詳細（大きい絵・レア度・名前・大きさ・説明文）。新種は「NEW」を表示し、詳細を見ると消える
import { useState } from 'react';
import { REGIONS, INSECTS, RARITY, insectsOfRegion } from '@/lib/insects';
import InsectArt from './InsectArt';
import Modal from './Modal';

export default function ZukanScreen({ save, onSeen, onClose }) {
  const [selected, setSelected] = useState(null);
  const total = INSECTS.length;
  const got = Object.keys(save.dex).length;

  function open(insect) {
    setSelected(insect);
    onSeen(insect.id);
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="modal-title">むしコレ図鑑</h2>
      <p className="modal-hint">
        集めた数：{got} / {total}（タップで詳しく見られます）
      </p>
      {REGIONS.map((region) => {
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
          <div className="detail-art">
            <InsectArt rows={selected.grid} dot={9} />
          </div>
          <p className="detail-rarity" style={{ color: RARITY[selected.rarity].color }}>
            {RARITY[selected.rarity].label}
          </p>
          <h3 className="detail-name">{selected.name}</h3>
          <p className="detail-size">大きさ：{selected.sizeText}</p>
          <p className="detail-desc">{selected.description}</p>
          <p className="detail-count">捕まえた回数：{save.dex[selected.id]?.count ?? 0}</p>
        </Modal>
      )}
    </Modal>
  );
}
