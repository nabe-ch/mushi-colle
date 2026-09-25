'use client';

// セーブデータのバックアップ（コードでの書き出し・読み込み）。
// 進み具合は、このブラウザに自動で保存されている。ブラウザのデータを消したときの備えや、別の端末への引き継ぎに使う
import { useState } from 'react';
import { exportSaveCode, importSaveCode } from '@/lib/game';
import Modal from './Modal';

export default function SaveDataModal({ save, onImport, onClose }) {
  const code = exportSaveCode(save);
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(null); // 読み込み前の確認待ちのデータ

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setMessage('コードをコピーしました。メモアプリなどに貼りつけて、大切に保管してください。');
    } catch {
      setMessage('コピーできませんでした。上の枠を長押し（または全選択）して、コピーしてください。');
    }
  }

  function downloadCode() {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mushicolle-save.txt';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('ファイル（mushicolle-save.txt）に保存しました。');
  }

  function checkImport() {
    const loaded = importSaveCode(input);
    if (!loaded) {
      setPending(null);
      setMessage('コードを読み込めませんでした。「MUSHICOLLE1:」から始まるコードを、すべて貼りつけてください。');
      return;
    }
    setPending(loaded);
    setMessage('');
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="modal-title">セーブデータ</h2>
      <p className="modal-hint">
        進み具合（図鑑・お金・道具など）は、このブラウザに自動で保存されています。ブラウザのデータを消すと、なくなってしまうので、念のためのバックアップや、別の端末への引き継ぎに、コードを使えます。
      </p>

      <section className="savedata-section">
        <p className="savedata-title">バックアップ（書き出し）</p>
        <textarea className="savedata-code" readOnly value={code} rows={3} onFocus={(e) => e.target.select()} />
        <div className="savedata-buttons">
          <button type="button" className="btn btn-small" onClick={copyCode}>
            コードをコピー
          </button>
          <button type="button" className="btn btn-small btn-sub" onClick={downloadCode}>
            ファイルに保存
          </button>
        </div>
      </section>

      <section className="savedata-section">
        <p className="savedata-title">読み込み（引き継ぎ）</p>
        <textarea
          className="savedata-code"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setPending(null);
          }}
          placeholder="バックアップしたコードを、ここに貼りつけます"
          rows={3}
        />
        <div className="savedata-buttons">
          <button type="button" className="btn btn-small" onClick={checkImport} disabled={!input.trim()}>
            読み込む
          </button>
        </div>
        {pending && (
          <div className="savedata-confirm">
            <p>
              集めた虫 {Object.keys(pending.dex).length}種のデータを読み込みます。いまのデータは上書きされます。よろしいですか？
            </p>
            <div className="savedata-buttons">
              <button
                type="button"
                className="btn btn-small"
                onClick={() => {
                  onImport(pending);
                  onClose();
                }}
              >
                はい、読み込む
              </button>
              <button type="button" className="btn btn-small btn-sub" onClick={() => setPending(null)}>
                やめる
              </button>
            </div>
          </div>
        )}
      </section>

      {message && <p className="savedata-message">{message}</p>}
    </Modal>
  );
}
