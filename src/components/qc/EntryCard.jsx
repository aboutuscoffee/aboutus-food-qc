function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

function refUsable(r) {
  if (!r) return null;
  if (!r.photo_url && !r.video_url && !r.points) return null;
  return r;
}

export default function EntryCard({ entry: e, open, onToggle, reference, onDelete }) {
  const ref = refUsable(reference);

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
              background: e.disposition === '提供' ? 'var(--good-soft)' : 'var(--warn-soft)',
              color: e.disposition === '提供' ? '#33452C' : 'var(--warn)',
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

        {ref && (
          <>
            <p className="qcf-section-title" style={{ marginTop: 14 }}>
              お手本と比較
            </p>
            <div className="qcf-compare-grid">
              <div>
                <p className="qcf-compare-col-label">お手本</p>
                {ref.photo_url ? <img className="qcf-compare-img" src={ref.photo_url} /> : <div className="qcf-compare-empty">写真なし</div>}
                {ref.video_url && (
                  <a className="qcf-ref-video-link" href={ref.video_url} target="_blank" rel="noopener noreferrer">
                    動画を見る ↗
                  </a>
                )}
              </div>
              <div>
                <p className="qcf-compare-col-label">今回の記録</p>
                {e.media_type === 'image' && e.media_url ? (
                  <img className="qcf-compare-img" src={e.media_url} />
                ) : (
                  <div className="qcf-compare-empty">{e.media_name ? '動画あり' : '写真なし'}</div>
                )}
              </div>
            </div>
            {ref.points && <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 8 }}>お手本の要点：{ref.points}</p>}
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
