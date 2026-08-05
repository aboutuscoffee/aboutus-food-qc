import { useState } from 'react';
import { CATEGORIES, MENUS, MANAGER_PIN } from '../../lib/constants';
import ReferenceListItem from './ReferenceListItem';

function refFor(referenceLibrary, dishName) {
  const r = referenceLibrary.find((x) => x.dish_name === dishName);
  if (!r) return null;
  if (!r.photo_url && !r.video_url && !r.points) return null;
  return r;
}

export default function ReferenceTab({ referenceLibrary, onUploadPhoto, onSave, showToast }) {
  const [isManager, setIsManager] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [openRefName, setOpenRefName] = useState(null);
  const [editingRefName, setEditingRefName] = useState(null);

  const handlePinSubmit = () => {
    if (pinInput === MANAGER_PIN) {
      setIsManager(true);
      setPinInput('');
      showToast('管理者モードになりました。', false);
    } else {
      showToast('PINが違います。', true);
    }
  };

  const handleToggle = (name) => {
    setOpenRefName((cur) => (cur === name ? null : name));
    setEditingRefName(null);
  };

  const handleEdit = (name) => {
    setEditingRefName(name);
    setOpenRefName(name);
  };

  const handleSave = async (name, fields) => {
    try {
      await onSave(name, fields);
      showToast('お手本を保存しました。', false);
      setEditingRefName(null);
      setOpenRefName(name);
    } catch (e) {
      showToast('保存に失敗しました：' + e.message, true);
    }
  };

  return (
    <>
      {isManager ? (
        <div className="qcf-manager-row">
          <span className="qcf-manager-badge">管理者モード有効</span>
          <button type="button" className="qcf-manager-btn" onClick={() => { setIsManager(false); setEditingRefName(null); }}>
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
              reference={refFor(referenceLibrary, name)}
              rawReference={referenceLibrary.find((r) => r.dish_name === name) ?? null}
              open={openRefName === name}
              editing={editingRefName === name}
              isManager={isManager}
              onToggle={() => handleToggle(name)}
              onEdit={() => handleEdit(name)}
              onCancelEdit={() => setEditingRefName(null)}
              onUploadPhoto={onUploadPhoto}
              onSave={(fields) => handleSave(name, fields)}
            />
          ))}
        </div>
      ))}
    </>
  );
}
