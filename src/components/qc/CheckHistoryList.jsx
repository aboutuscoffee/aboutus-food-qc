import { staffName } from '../../lib/selectors';

export default function CheckHistoryList({ checks, staff, selectedId, onSelect }) {
  if (checks.length === 0) {
    return <p className="text-sm text-taupe-subtitle">まだチェック履歴がありません。</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {checks.map((c) => {
        const active = c.id === selectedId;
        const pass = c.overall_result === 'pass';
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={
              'px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5 ' +
              (active ? 'border-taupe-title bg-taupe-header' : 'border-taupe-border bg-white')
            }
          >
            <span className={'w-1.5 h-1.5 rounded-full ' + (pass ? 'bg-taupe-heading' : 'bg-taupe-ng')} />
            {c.check_date}　{staffName(staff, c.staff_id)}
          </button>
        );
      })}
    </div>
  );
}
