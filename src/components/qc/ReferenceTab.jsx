import { useState } from 'react';
import { CATEGORIES, MENUS, MANAGER_PIN } from '../../lib/constants';
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
  const [openRefName, setOpenRefName] = useState(null);

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

      {CATEGORIES.map((cat) => (
        <div key={cat}>
          <p className="qcf-section-title">{cat}</p>
          {(MENUS[cat] || []).map((name) => (
            <ReferenceListItem
              key={name}
              name={name}
              points={referencePoints}
              media={referencePointMedia}
              open={openRefName === name}
              isManager={isManager}
              onToggle={() => setOpenRefName((cur) => (cur === name ? null : name))}
              onAddPoint={wrap(onAddPoint)}
              onUpdatePointText={wrap(onUpdatePointText)}
              onDeletePoint={wrap(onDeletePoint)}
              onAddMedia={wrap(onAddMedia)}
              onDeleteMedia={wrap(onDeleteMedia)}
              onAddLink={wrap(onAddLink)}
            />
          ))}
        </div>
      ))}
    </>
  );
}
