export default function PointMediaLightbox({ pointText, media, onClose }) {
  return (
    <div
      style={{
        marginTop: 8,
        marginBottom: 12,
        border: '0.5px solid var(--line)',
        borderRadius: 8,
        padding: 10,
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{pointText}</p>
        <button
          type="button"
          onClick={onClose}
          style={{ border: 'none', background: 'transparent', color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1, padding: 0 }}
        >
          ×
        </button>
      </div>
      {media.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>写真・動画は登録されていません。</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {media.map((m) =>
            m.media_type === 'video' ? (
              <video key={m.id} src={m.media_url} controls style={{ height: 160, borderRadius: 6, flexShrink: 0 }} />
            ) : (
              <img key={m.id} src={m.media_url} alt={m.media_name ?? ''} style={{ height: 160, borderRadius: 6, flexShrink: 0 }} />
            )
          )}
        </div>
      )}
    </div>
  );
}
