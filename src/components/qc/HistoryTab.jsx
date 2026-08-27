import { useMemo, useState } from 'react';
import { STORES, CATEGORIES, MENUS } from '../../lib/constants';
import EntryCard from './EntryCard';

export default function HistoryTab({ entries, referencePoints, referencePointMedia, onDelete, showToast }) {
  const [filterStore, setFilterStore] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMenu, setFilterMenu] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [openEntryId, setOpenEntryId] = useState(null);

  const allMenus = useMemo(() => [...new Set(Object.values(MENUS).flat())].sort(), []);

  const filtered = entries
    .filter((e) => filterStore === 'all' || e.store === filterStore)
    .filter((e) => filterCategory === 'all' || e.category === filterCategory)
    .filter((e) => filterMenu === 'all' || e.dish_name === filterMenu)
    .filter((e) => !filterDate || e.date === filterDate)
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      showToast('記録を削除しました。', false);
    } catch (e) {
      showToast('削除に失敗しました：' + e.message, true);
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <select style={{ fontSize: 12, padding: '6px 8px' }} value={filterStore} onChange={(e) => setFilterStore(e.target.value)}>
          <option value="all">すべての店舗</option>
          {STORES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select style={{ fontSize: 12, padding: '6px 8px' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">すべてのカテゴリ</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select style={{ fontSize: 12, padding: '6px 8px' }} value={filterMenu} onChange={(e) => setFilterMenu(e.target.value)}>
          <option value="all">すべてのメニュー</option>
          {allMenus.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ fontSize: 12, padding: '6px 8px', border: '0.5px solid var(--line)', borderRadius: 6, background: '#fff', color: 'var(--ink)', width: '100%' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="qcf-empty">条件に一致する記録がありません。</div>
      ) : (
        filtered.map((e) => (
          <EntryCard
            key={e.id}
            entry={e}
            open={openEntryId === e.id}
            onToggle={() => setOpenEntryId((cur) => (cur === e.id ? null : e.id))}
            referencePoints={referencePoints}
            referencePointMedia={referencePointMedia}
            onDelete={() => handleDelete(e.id)}
          />
        ))
      )}
    </>
  );
}
