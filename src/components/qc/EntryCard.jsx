import { useState } from 'react';
import { pointsForDish } from '../../lib/selectors';
import ReferencePointsView from './ReferencePointsView';

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

function dispositionStyle(disposition) {
  if (disposition === '提供') return { background: 'var(--good-soft)', color: '#333333' };
  if (disposition === '廃棄') return { background: 'var(--warn-soft)', color: 'var(--warn)' };
  return { background: 'var(--amber-soft)', color: 'var(--dark)' };
}

export default function EntryCard({ entry: e, open, onToggle, referencePoints, referencePointMedia, onDelete }) {
  const [refOpen, setRefOpen] = useState(false);
  const dishPoints = pointsForDish(referencePoints, e.dish_name);

  return (
    <div className="qcf-entry-card">
      <div className="qcf-entry-top" onClick={onToggle}>
        <div>
          <span className="qcf-entry-store">{e.store || '—'}</span>
          <span className="qcf-entry-date">{fmtDate(e.date)}</span>
          {e.category && <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 8 }}>{e.category}</span>}
          <div className="qcf-entry-dish">{e.dish_name || 'メニュー名未選択'}</div>
          <div className="qcf-entry-checker">
            担当：{e.maker || '—'}　確認者：{e.checker || '—'}
          </div>
        </div>
        <span className="qcf-chevron">{open ? '▲' : '▼'}</span>
      </div>

      <div className={'qcf-entry-detail' + (open ? ' open' : '')}>
        {e.media_name && (
          e.media_type === 'image' && e.media_url ? (
            <img style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, marginBottom: 8, display: 'block' }} src={e.media_url} />
          ) : e.media_type === 'video' && e.media_url ? (
            <video style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8, marginBottom: 8, display: 'block' }} src={e.media_url} controls />
          ) : (
            <div style={{ fontSize: 12, marginBottom: 8 }}>🎬 {e.media_name}</div>
          )
        )}

        {e.disposition && (
          <div
            style={{
              display: 'inline-block',
              fontSize: 12,
              fontWeight: 500,
              padding: '3px 12px',
              borderRadius: 999,
              marginBottom: 8,
              ...dispositionStyle(e.disposition),
            }}
          >
            {e.disposition}
          </div>
        )}

        <div className="qcf-cause-block">
          推測できる要因：<b style={{ color: 'var(--ink)' }}>{e.cause || '—'}</b>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 8 }}>
          問題発生日：<b style={{ color: 'var(--ink)' }}>{fmtDate(e.found_date) || '—'}</b>　作った人：
          <b style={{ color: 'var(--ink)' }}>{e.maker || '—'}</b>　確認者：<b style={{ color: 'var(--ink)' }}>{e.checker || '—'}</b>
        </div>

        {e.checker_comment && (
          <div style={{ fontSize: 12, background: 'var(--amber-soft)', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
            確認者コメント：{e.checker_comment}
          </div>
        )}

        {e.note && <div style={{ fontSize: 12, marginTop: 6 }}>総合メモ：{e.note}</div>}

        {dishPoints.length > 0 && (
          <>
            <div className="qcf-ref-toggle" style={{ marginTop: 10 }} onClick={(ev) => { ev.stopPropagation(); setRefOpen((v) => !v); }}>
              <span className="qcf-ref-toggle-label">お手本を見る（工程ごとのポイント）</span>
              <span className="qcf-chevron">{refOpen ? '▲' : '▼'}</span>
            </div>
            {refOpen && (
              <div style={{ border: '0.5px solid var(--line)', borderRadius: 8, padding: 10, marginBottom: 8, background: '#fff' }}>
                <ReferencePointsView dishName={e.dish_name} points={referencePoints} media={referencePointMedia} isManager={false} />
              </div>
            )}
          </>
        )}

        <button
          type="button"
          className="qcf-del-entry"
          onClick={(ev) => {
            ev.stopPropagation();
            onDelete();
          }}
        >
          この記録を削除
        </button>
      </div>
    </div>
  );
}
