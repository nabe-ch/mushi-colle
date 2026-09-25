'use client';

// 図鑑コンプリートのお祝い（その地域の虫を、ぜんぶ集めたとき。3秒間表示して、自動で消える）
import { crownGrid } from '@/lib/sprites';
import { insectsOfRegion } from '@/lib/insects';
import InsectArt from './InsectArt';

export default function CompleteCelebration({ region }) {
  return (
    <div className="complete-overlay">
      <div className="complete-card">
        <div className="complete-crown">
          <InsectArt rows={crownGrid()} dot={10} />
        </div>
        <p className="complete-title">図鑑コンプリート！</p>
        <p className="complete-message">
          {region.name}の虫を、ぜんぶ集めました！
          <br />
          おめでとう！
        </p>
        <ul className="complete-bugs">
          {insectsOfRegion(region.id).map((insect) => (
            <li key={insect.id}>
              <InsectArt rows={insect.grid} dot={2} />
            </li>
          ))}
        </ul>
        <span className="complete-spark complete-spark-1" />
        <span className="complete-spark complete-spark-2" />
        <span className="complete-spark complete-spark-3" />
      </div>
    </div>
  );
}
