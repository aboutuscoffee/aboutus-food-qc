import { useEffect, useId, useState } from 'react';

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
}

export default function ReferenceListItem({
  name,
  reference,
  rawReference,
  open,
  editing,
  isManager,
  onToggle,
  onEdit,
  onCancelEdit,
  onUploadPhoto,
  onSave,
}) {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [points, setPoints] = useState('');
  const [saving, setSaving] = useState(false);
  const photoInputId = 'qcf-ref-photo-input-' + useId();

  useEffect(() => {
    if (editing) {
      setPhotoFile(null);
      setPhotoPreviewUrl(rawReference?.photo_url || '');
      setVideoUrl(rawReference?.video_url || '');
      setPoints(rawReference?.points || '');
    }
  }, [editing, rawReference]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photoFields = {};
      if (photoFile) {
        const uploaded = await onUploadPhoto(photoFile);
        photoFields = { photo_url: uploaded.url, photo_name: uploaded.name };
      }
      await onSave({
        ...photoFields,
        video_url: videoUrl.trim(),
        points: points.trim(),
        updated_at: new Date().toISOString().slice(0, 10),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="qcf-ref-list-item">
      <div className="qcf-ref-list-top" onClick={onToggle}>
        {reference?.photo_url ? (
          <img className="qcf-ref-list-thumb" src={reference.photo_url} />
        ) : (
          <div className="qcf-ref-list-thumb" />
        )}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13 }}>{name}</span>{' '}
          {reference ? <span className="qcf-ref-badge-ok">登録済み</span> : <span className="qcf-ref-badge-none">未登録</span>}
        </div>
        <span className="qcf-chevron">{open ? '▲' : '▼'}</span>
      </div>

      {open && editing && (
        <div className="qcf-ref-edit-box">
          <div className="qcf-field">
            <label htmlFor={photoInputId}>お手本写真</label>
            <label className="qcf-media-zone" htmlFor={photoInputId}>
              {photoPreviewUrl ? (
                <img className="qcf-media-thumb" src={photoPreviewUrl} />
              ) : (
                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>タップして写真を選択</div>
              )}
            </label>
            <input id={photoInputId} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>
          <div className="qcf-field" style={{ marginTop: 8 }}>
            <label>動画リンク（YouTube・Googleドライブ等）</label>
            <input type="text" placeholder="https://..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
          <div className="qcf-field" style={{ marginTop: 8 }}>
            <label>要点メモ</label>
            <textarea rows={2} placeholder="例）断面の層の厚さ・焼き色を確認" value={points} onChange={(e) => setPoints(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="qcf-ref-save-btn" disabled={saving} onClick={handleSave}>
              {saving ? '保存中…' : '保存'}
            </button>
            <button
              type="button"
              className="qcf-ref-save-btn"
              style={{ background: '#fff', color: 'var(--ink-soft)', border: '0.5px solid var(--line)' }}
              onClick={onCancelEdit}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {open && !editing && reference && (
        <div className="qcf-ref-detail open">
          {reference.photo_url && <img className="qcf-media-thumb" src={reference.photo_url} />}
          {reference.video_url && (
            <a className="qcf-ref-video-link" href={reference.video_url} target="_blank" rel="noopener noreferrer">
              動画を見る ↗
            </a>
          )}
          {reference.points && <p style={{ fontSize: 12, margin: '8px 0 0' }}>{reference.points}</p>}
          {reference.updated_at && <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '6px 0 0' }}>更新日：{fmtDate(reference.updated_at)}</p>}
          {isManager && (
            <button type="button" className="qcf-ref-save-btn" onClick={onEdit}>
              編集する
            </button>
          )}
        </div>
      )}

      {open && !editing && !reference && (
        <div className="qcf-ref-detail open">
          <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>お手本はまだ登録されていません。</p>
          {isManager && (
            <button type="button" className="qcf-ref-save-btn" onClick={onEdit}>
              お手本を登録
            </button>
          )}
        </div>
      )}
    </div>
  );
}
