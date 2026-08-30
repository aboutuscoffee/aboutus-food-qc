import { useState } from 'react';
import { REFERENCE_GROUPS, MANAGER_PIN } from '../../lib/constants';
import ReferenceListItem from './ReferenceListItem';

export default function ReferenceTab({
  referencePoints,
  referencePointMedia,
  onAddPoint,
  onUpdatePointText,
  onDeletePoint,
  onAddMedia,
  onDeleteMedia,
  onAddLink,
  showToast,
}) {
  const [isManager, setIsManager] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [openRefKey, setOpenRefKey] = useState(null);

  const handlePinSubmit = () => {
    if (pinInput === MANAGER_PIN) {
      setIsManager(true);
      setPinInput('');
      showToast('管理者モードになりました。', false);
    } else {
      showToast('PINが違います。', true);
    }
  };

  const wrap = (fn, okMsg) => async (...args) => {
    try {
      await fn(...args);
      if (okMsg) showToast(okMsg, false);
    } catch (e) {
      showToast('操作に失敗しました：' + e.message, true);
    }
  };

  const dishList = (dishes, purpose) =>
    dishes.map((name) => {
      const key = purpose + ':' + name;
      return (
        <ReferenceListItem
          key={key}
          name={name}
          purpose={purpose}
          points={referencePoints}
          media={referencePointMedia}
          open={openRefKey === key}
          isManager={isManager}
          onToggle={() => setOpenRefKey((cur) => (cur === key ? null : key))}
          onAddPoint={wrap(onAddPoint)}
          onUpdatePointText={wrap(onUpdatePointText)}
          onDeletePoint={wrap(onDeletePoint)}
          onAddMedia={wrap(onAddMedia)}
          onDeleteMedia={wrap(onDeleteMedia)}
          onAddLink={wrap(onAddLink)}
        />
      );
    });

  return (
    <>
      {isManager ? (
        <div className="qcf-manager-row">
          <span className="qcf-manager-badge">管理者モード有効</span>
          <button type="button" className="qcf-manager-btn" onClick={() => setIsManager(false)}>
            終了
          </button>
        </div>
      ) : (
        <div className="qcf-pin-row">
          <input type="password" placeholder="PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
          <button type="button" className="qcf-pin-go" onClick={handlePinSubmit}>
            管理者モード
          </button>
        </div>
      )}

      {REFERENCE_GROUPS.map((group) => (
        <div key={group.key}>
          <p className="qcf-section-title">{group.label}</p>
          {group.dishes && dishList(group.dishes, group.purpose)}
          {group.subgroups &&
            group.subgroups.map((sub) => (
              <div key={sub.key} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', margin: '0 0 6px' }}>{sub.label}</p>
                {dishList(sub.dishes, group.purpose)}
              </div>
            ))}
        </div>
      ))}
    </>
  );
}
