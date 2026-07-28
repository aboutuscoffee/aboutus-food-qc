import { useState } from 'react';

export default function StaffManager({ staff, onAdd, onToggleActive, onDelete }) {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const sorted = staff.slice().sort((a, b) => a.sort_order - b.sort_order);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await onAdd(trimmed);
      setName('');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-bold text-taupe-heading mb-3">スタッフ名簿</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border border-taupe-border rounded px-2 py-1.5 text-sm"
          placeholder="新しいスタッフ名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !name.trim()}
          className="px-4 py-1.5 rounded text-sm bg-taupe-title text-white disabled:opacity-40"
        >
          追加
        </button>
      </div>

      <div className="space-y-1.5">
        {sorted.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between bg-white border border-taupe-border rounded px-3 py-2 text-sm"
          >
            <span className={s.active ? '' : 'text-taupe-subtitle line-through'}>{s.name}</span>
            <div className="flex gap-3 text-xs">
              <button className="text-taupe-heading underline" onClick={() => onToggleActive(s)}>
                {s.active ? '無効にする' : '有効にする'}
              </button>
              <button className="text-taupe-ng underline" onClick={() => onDelete(s.id)}>
                削除
              </button>
            </div>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-sm text-taupe-subtitle">スタッフが登録されていません。</p>}
      </div>
    </div>
  );
}
