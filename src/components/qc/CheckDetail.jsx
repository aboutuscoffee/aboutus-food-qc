import { staffName } from '../../lib/selectors';

export default function CheckDetail({ check, items, results, staff }) {
  const resultByItem = new Map(results.map((r) => [r.checklist_item_id, r]));
  const pass = check.overall_result === 'pass';

  return (
    <div className="bg-white border border-taupe-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium">{check.check_date}</span>
          <span className="text-taupe-subtitle ml-2">担当：{staffName(staff, check.staff_id)}</span>
          <span className="text-taupe-subtitle ml-2">チェック：{check.checked_by_name}</span>
        </div>
        <span
          className={
            'px-2 py-0.5 rounded-full text-xs text-white ' + (pass ? 'bg-taupe-heading' : 'bg-taupe-ng')
          }
        >
          {pass ? '合格' : '要改善'}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const r = resultByItem.get(item.id);
          const ok = r?.result === 'ok';
          return (
            <div key={item.id} className="text-sm bg-taupe-bg rounded p-2.5">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.item_name}</span>
                <span className={'text-xs font-bold ' + (ok ? 'text-taupe-heading' : 'text-taupe-ng')}>
                  {ok ? 'OK' : 'NG'}
                </span>
              </div>
              {r?.comment && <div className="text-xs text-taupe-ng mt-1">{r.comment}</div>}
            </div>
          );
        })}
      </div>

      {check.overall_comment && (
        <div className="text-sm">
          <span className="text-taupe-subtitle">総合コメント：</span>
          {check.overall_comment}
        </div>
      )}
    </div>
  );
}
