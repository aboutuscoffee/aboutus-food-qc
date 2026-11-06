import { useState } from 'react';
import ReferencePointsView from './ReferencePointsView';
import { pointsForDish } from '../../lib/selectors';

function DishPhotos({ id, photos, isManager, onAdd, onDelete, purpose, name }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    Promise.resolve(onAdd(name, purpose, file)).finally(() => setUploading(false));
  };
  if (photos.length === 0 && !isManager) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 6 }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: 'relative', flexShrink: 0 }}>
              <img src={p.media_url} alt={p.media_name ?? ''} style={{ height: 140, borderRadius: 8, display: 'block' }} />
              {isManager && (
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: 12, lineHeight: '20px', padding: 0 }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {isManager && (
        <>
          <label htmlFor={id} style={{ fontSize: 11, color: 'var(--blue)', cursor: 'pointer' }}>
            {uploading ? 'アップロード中…' : '＋ 完成写真を追加'}
          </label>
          <input id={id} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </>
      )}
    </div>
  );
}

export default function ReferenceListItem({
  name,
  purpose,
  points,
  media,
  photos,
  open,
  isManager,
  onToggle,
  onAddPoint,
  onUpdatePointText,
  onDeletePoint,
  onAddMedia,
  onDeleteMedia,
  onAddLink,
  onAddPhoto,
  onDeletePhoto,
}) {
  const dishPoints = pointsForDish(points, name, purpose);
  const hasContent = dishPoints.length > 0 || photos.length > 0;

  return (
    <div className="qcf-ref-list-item">
      <div className="qcf-ref-list-top" onClick={onToggle}>
        {photos.length > 0 ? (
          <img className="qcf-ref-list-thumb" src={photos[0].media_url} alt="" />
        ) : (
          <div className="qcf-ref-list-thumb" />
        )}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13 }}>{name}</span>{' '}
          {hasContent ? <span className="qcf-ref-badge-ok">登録済み</span> : <span className="qcf-ref-badge-none">未登録</span>}
        </div>
        <span className="qcf-chevron">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="qcf-ref-detail open">
          <DishPhotos
            id={`qcf-dish-photo-${purpose}-${name}`}
            photos={photos}
            isManager={isManager}
            onAdd={onAddPhoto}
            onDelete={onDeletePhoto}
            purpose={purpose}
            name={name}
          />
          <ReferencePointsView
            dishName={name}
            purpose={purpose}
            points={points}
            media={media}
            isManager={isManager}
            onAddPoint={onAddPoint}
            onUpdatePointText={onUpdatePointText}
            onDeletePoint={onDeletePoint}
            onAddMedia={onAddMedia}
            onDeleteMedia={onDeleteMedia}
            onAddLink={onAddLink}
          />
        </div>
      )}
    </div>
  );
}
