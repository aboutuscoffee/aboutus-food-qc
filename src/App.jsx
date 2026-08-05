import { useCallback, useEffect, useState } from 'react';
import { fetchAll, saveEntry, deleteEntry, uploadEntryMedia, uploadReferencePhoto, saveReferenceItem } from './lib/db';
import NewEntryForm from './components/qc/NewEntryForm';
import HistoryTab from './components/qc/HistoryTab';
import ReferenceTab from './components/qc/ReferenceTab';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const [toast, setToast] = useState(null); // { text, isError }

  useEffect(() => {
    fetchAll()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const showToast = useCallback((text, isError = false) => {
    setToast({ text, isError });
  }, []);

  const onSaveEntry = useCallback(async (entryFields) => {
    const saved = await saveEntry(entryFields);
    setData((d) => ({ ...d, entries: [saved, ...d.entries] }));
    return saved;
  }, []);

  const onDeleteEntry = useCallback(async (id) => {
    await deleteEntry(id);
    setData((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) }));
  }, []);

  const onSaveReferenceItem = useCallback(async (dishName, fields) => {
    const saved = await saveReferenceItem(dishName, fields);
    setData((d) => {
      const rest = d.referenceLibrary.filter((r) => r.dish_name !== dishName);
      return { ...d, referenceLibrary: [...rest, saved] };
    });
    return saved;
  }, []);

  const changeTab = (tab) => {
    setActiveTab(tab);
    setToast(null);
  };

  if (error) {
    return <div id="qcf-app"><div className="qcf-body"><div className="qcf-toast-err">読み込みエラー：{error}</div></div></div>;
  }
  if (!data) {
    return <div id="qcf-app"><div className="qcf-loading">読み込み中…</div></div>;
  }

  return (
    <div id="qcf-app">
      <div className="qcf-header">
        <p className="qcf-brand">ABOUT US COFFEE</p>
        <h1>フードメニュー QCログ</h1>
      </div>
      <div className="qcf-tabs">
        <button className={'qcf-tab' + (activeTab === 'new' ? ' active' : '')} onClick={() => changeTab('new')}>
          新規記録
        </button>
        <button className={'qcf-tab' + (activeTab === 'history' ? ' active' : '')} onClick={() => changeTab('history')}>
          履歴（{data.entries.length}）
        </button>
        <button className={'qcf-tab' + (activeTab === 'reference' ? ' active' : '')} onClick={() => changeTab('reference')}>
          お手本
        </button>
      </div>
      <div className="qcf-body">
        {toast && <div className={toast.isError ? 'qcf-toast-err' : 'qcf-toast'}>{toast.text}</div>}
        {activeTab === 'new' && (
          <NewEntryForm
            referenceLibrary={data.referenceLibrary}
            onUploadMedia={uploadEntryMedia}
            onSave={onSaveEntry}
            showToast={showToast}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab entries={data.entries} referenceLibrary={data.referenceLibrary} onDelete={onDeleteEntry} showToast={showToast} />
        )}
        {activeTab === 'reference' && (
          <ReferenceTab
            referenceLibrary={data.referenceLibrary}
            onUploadPhoto={uploadReferencePhoto}
            onSave={onSaveReferenceItem}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
}
