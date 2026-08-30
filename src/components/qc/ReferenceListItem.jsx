import ReferencePointsView from './ReferencePointsView';
import { pointsForDish } from '../../lib/selectors';

export default function ReferenceListItem({
  name,
  points,
  media,
  open,
  isManager,
  onToggle,
  onAddPoint,
  onUpdatePointText,
  onDeletePoint,
  onAddMedia,
  onDeleteMedia,
  onAddLink,
}) {
  const dishPoints = pointsForDish(points, name);
  const hasContent = dishPoints.length > 0;

  return (
    <div className="qcf-ref-list-item">
      <div className="qcf-ref-list-top" onClick={onToggle}>
        <div className="qcf-ref-list-thumb" />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13 }}>{name}</span>{' '}
          {hasContent ? <span className="qcf-ref-badge-ok">登録済み</span> : <span className="qcf-ref-badge-none">未登録</span>}
        </div>
        <span className="qcf-chevron">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="qcf-ref-detail open">
          <ReferencePointsView
            dishName={name}
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
