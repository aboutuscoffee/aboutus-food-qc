import { useState } from 'react';
import { pointsForDish, groupByProcess, mediaForPoint } from '../../lib/selectors';
import PointMediaLightbox from './PointMediaLightbox';

function PointMediaEditor({ point, media, onAddMedia, onDeleteMedia, onAddLink }) {
  const [uploading, setUploading] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    Promise.resolve(onAddMedia(point.id, file)).finally(() => setUploading(false));
  };

  const submitLink = async () => {
    const url = linkInput.trim();
    if (!url) return;
    await onAddLink(point.id, url);
    setLinkInput('');
    setLinkOpen(false);
  };

  return (
    <div style={{ marginTop: 6, marginLeft: 24 }}>
      {media.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          {media.map((m) => (
            <div
              key={m.id}
              style={{
                position: 'relative',
                width: 56,
                height: 56,
                borderRadius: 6,
                overflow: 'hidden',
                border: '0.5px solid var(--line)',
                background: m.media_type === 'link' ? 'var(--page)' : undefined,
              }}
            >
              {m.media_type === 'video' ? (
                <video src={m.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : m.media_type === 'link' ? (
                <a
                  href={m.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={m.media_url}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    fontSize: 18,
                    color: 'var(--blue)',
                    textDecoration: 'none',
                  }}
                >
                  🔗
                </a>
              ) : (
                <img src={m.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <button
                type="button"
                onClick={() => onDeleteMedia(m.id)}
                style={{
                  position: 'absolute',
                  top: 1,
                  right: 1,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: 10,
                  lineHeight: '16px',
                  border: 'none',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <label htmlFor={`qcf-point-media-${point.id}`} style={{ fontSize: 11, color: 'var(--blue)', cursor: 'pointer' }}>
          {uploading ? 'アップロード中…' : '＋ 写真/動画を追加'}
        </label>
        <button
          type="button"
          onClick={() => setLinkOpen((v) => !v)}
          style={{ fontSize: 11, color: 'var(--blue)', background: 'none', border: 'none', padding: 0 }}
        >
          ＋ リンクを追加
        </button>
      </div>
      <input id={`qcf-point-media-${point.id}`} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFile} />
      {linkOpen && (
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input
            type="text"
            placeholder="https://..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            style={{ flex: 1, fontSize: 12, padding: '4px 6px', border: '0.5px solid var(--line)', borderRadius: 6 }}
          />
          <button type="button" onClick={submitLink} style={{ fontSize: 11 }}>
            追加
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReferencePointsView({
  dishName,
  purpose,
  points,
  media,
  isManager,
  onAddPoint,
  onUpdatePointText,
  onDeletePoint,
  onAddMedia,
  onDeleteMedia,
  onAddLink,
}) {
  const [openPointId, setOpenPointId] = useState(null);
  const [editingPointId, setEditingPointId] = useState(null);
  const [editText, setEditText] = useState('');
  const [newPointDraft, setNewPointDraft] = useState({}); // process_name -> text
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessPointText, setNewProcessPointText] = useState('');

  const dishPoints = pointsForDish(points, dishName, purpose);
  const groups = groupByProcess(dishPoints);

  const startEdit = (point) => {
    setEditingPointId(point.id);
    setEditText(point.point_text);
  };

  const saveEdit = async (point) => {
    if (!editText.trim()) return;
    await onUpdatePointText(point.id, editText.trim());
    setEditingPointId(null);
  };

  const addPointToProcess = async (processName) => {
    const text = (newPointDraft[processName] || '').trim();
    if (!text) return;
    await onAddPoint({ dish_name: dishName, purpose, process_name: processName, point_text: text, sort_order: 999 });
    setNewPointDraft((d) => ({ ...d, [processName]: '' }));
  };

  const addProcess = async () => {
    if (!newProcessName.trim() || !newProcessPointText.trim()) return;
    await onAddPoint({ dish_name: dishName, purpose, process_name: newProcessName.trim(), point_text: newProcessPointText.trim(), sort_order: 999 });
    setNewProcessName('');
    setNewProcessPointText('');
  };

  if (groups.length === 0 && !isManager) {
    return <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>お手本はまだ登録されていません。</p>;
  }

  return (
    <div>
      {groups.map((g) => (
        <div key={g.process_name} style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--blue)', borderBottom: '0.5px solid var(--line)', paddingBottom: 4, margin: '0 0 6px' }}>
            {g.process_name}
          </p>
          {g.points.map((pt) => {
            const ptMedia = mediaForPoint(media, pt.id);
            const editing = editingPointId === pt.id;
            return (
              <div key={pt.id} style={{ marginBottom: 6 }}>
                {editing ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{ flex: 1, fontSize: 13, padding: '4px 6px', border: '0.5px solid var(--line)', borderRadius: 6 }}
                    />
                    <button type="button" onClick={() => saveEdit(pt)} style={{ fontSize: 11 }}>
                      保存
                    </button>
                    <button type="button" onClick={() => setEditingPointId(null)} style={{ fontSize: 11 }}>
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      onClick={() => ptMedia.length > 0 && setOpenPointId((cur) => (cur === pt.id ? null : pt.id))}
                      style={{
                        flex: 1,
                        fontSize: 13,
                        cursor: ptMedia.length > 0 ? 'pointer' : 'default',
                        color: ptMedia.length > 0 ? 'var(--blue)' : 'var(--ink)',
                        textDecoration: ptMedia.length > 0 ? 'underline' : 'none',
                      }}
                    >
                      {ptMedia.length > 0 ? '📎 ' : ''}
                      {pt.point_text}
                    </div>
                    {isManager && (
                      <>
                        <button type="button" onClick={() => startEdit(pt)} style={{ fontSize: 11 }}>
                          編集
                        </button>
                        <button type="button" onClick={() => onDeletePoint(pt.id)} style={{ fontSize: 11, color: 'var(--warn)' }}>
                          削除
                        </button>
                      </>
                    )}
                  </div>
                )}
                {openPointId === pt.id && !editing && (
                  <PointMediaLightbox pointText={pt.point_text} media={ptMedia} onClose={() => setOpenPointId(null)} />
                )}
                {isManager && !editing && (
                  <PointMediaEditor point={pt} media={ptMedia} onAddMedia={onAddMedia} onDeleteMedia={onDeleteMedia} onAddLink={onAddLink} />
                )}
              </div>
            );
          })}
          {isManager && (
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <input
                type="text"
                placeholder="この工程に新しいポイントを追加"
                value={newPointDraft[g.process_name] || ''}
                onChange={(e) => setNewPointDraft((d) => ({ ...d, [g.process_name]: e.target.value }))}
                style={{ flex: 1, fontSize: 12, padding: '4px 6px', border: '0.5px solid var(--line)', borderRadius: 6 }}
              />
              <button type="button" onClick={() => addPointToProcess(g.process_name)} style={{ fontSize: 11 }}>
                追加
              </button>
            </div>
          )}
        </div>
      ))}

      {isManager && (
        <div style={{ background: 'var(--amber-soft)', borderRadius: 8, padding: 10, marginTop: 10 }}>
          <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '0 0 6px' }}>新しい工程を追加</p>
          <input
            type="text"
            placeholder="工程名（例：工程4：仕上げ）"
            value={newProcessName}
            onChange={(e) => setNewProcessName(e.target.value)}
            style={{ width: '100%', fontSize: 12, padding: '4px 6px', border: '0.5px solid var(--line)', borderRadius: 6, marginBottom: 6 }}
          />
          <input
            type="text"
            placeholder="最初のポイント"
            value={newProcessPointText}
            onChange={(e) => setNewProcessPointText(e.target.value)}
            style={{ width: '100%', fontSize: 12, padding: '4px 6px', border: '0.5px solid var(--line)', borderRadius: 6, marginBottom: 6 }}
          />
          <button type="button" onClick={addProcess} style={{ fontSize: 12 }}>
            工程を追加
          </button>
        </div>
      )}
    </div>
  );
}
