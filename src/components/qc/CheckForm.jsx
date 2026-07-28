import { useMemo, useState } from 'react';
import { groupByProcess } from '../../lib/selectors';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function CheckForm({ product, items, staff, onSave, onCancel }) {
  const groups = useMemo(() => groupByProcess(items), [items]);
  const [staffId, setStaffId] = useState('');
  const [checkedByName, setCheckedByName] = useState('');
  const [checkDate, setCheckDate] = useState(today());
  const [answers, setAnswers] = useState({}); // itemId -> { result, comment }
  const [overallResult, setOverallResult] = useState('pass');
  const [overallComment, setOverallComment] = useState('');
  const [saving, setSaving] = useState(false);

  const setAnswer = (itemId, patch) => {
    setAnswers((a) => ({ ...a, [itemId]: { ...a[itemId], ...patch } }));
    const next = { ...answers[itemId], ...patch };
    if (next.result === 'ng') setOverallResult('needs_improvement');
  };

  const allAnswered = items.every((i) => answers[i.id]?.result);
  const canSave = staffId && checkedByName.trim() && allAnswered && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(
        {
          product_id: product.id,
          staff_id: Number(staffId),
          checked_by_name: checkedByName.trim(),
          check_date: checkDate,
          overall_result: overallResult,
          overall_comment: overallComment,
        },
        items.map((i) => ({
          checklist_item_id: i.id,
          result: answers[i.id]?.result ?? 'ok',
          comment: answers[i.id]?.comment ?? '',
        }))
      );
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-taupe-border rounded-lg p-4 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block text-taupe-subtitle mb-1">担当者（仕込んだ人）</span>
          <select
            className="w-full border border-taupe-border rounded px-2 py-1.5 bg-white"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
          >
            <option value="">選択してください</option>
            {staff
              .filter((s) => s.active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-taupe-subtitle mb-1">チェック者</span>
          <input
            className="w-full border border-taupe-border rounded px-2 py-1.5"
            placeholder="例：店長名"
            value={checkedByName}
            onChange={(e) => setCheckedByName(e.target.value)}
          />
        </label>
        <label className="text-sm col-span-2">
          <span className="block text-taupe-subtitle mb-1">チェック日</span>
          <input
            type="date"
            className="border border-taupe-border rounded px-2 py-1.5"
            value={checkDate}
            onChange={(e) => setCheckDate(e.target.value)}
          />
        </label>
      </div>

      {groups.map((g) => (
        <div key={g.process_name}>
          <h3 className="text-sm font-bold text-taupe-heading border-b border-taupe-border pb-1 mb-2">
            {g.process_name}
          </h3>
          <div className="space-y-3">
            {g.items.map((item) => {
              const a = answers[item.id] ?? {};
              return (
                <div key={item.id} className="text-sm bg-taupe-bg rounded p-2.5">
                  <div className="font-medium">{item.item_name}</div>
                  <div className="text-xs text-taupe-subtitle mt-0.5">{item.criteria_text}</div>
                  {item.ng_example_text && (
                    <div className="text-xs text-taupe-ng mt-0.5 italic">NG例：{item.ng_example_text}</div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setAnswer(item.id, { result: 'ok' })}
                      className={
                        'px-3 py-1 rounded text-xs border ' +
                        (a.result === 'ok'
                          ? 'bg-taupe-heading text-white border-taupe-heading'
                          : 'bg-white border-taupe-border text-taupe-body')
                      }
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswer(item.id, { result: 'ng' })}
                      className={
                        'px-3 py-1 rounded text-xs border ' +
                        (a.result === 'ng'
                          ? 'bg-taupe-ng text-white border-taupe-ng'
                          : 'bg-white border-taupe-border text-taupe-body')
                      }
                    >
                      NG
                    </button>
                  </div>
                  {a.result === 'ng' && (
                    <textarea
                      className="w-full mt-2 border border-taupe-border rounded px-2 py-1 text-xs"
                      rows={2}
                      placeholder="原因・対処メモ"
                      value={a.comment ?? ''}
                      onChange={(e) => setAnswer(item.id, { comment: e.target.value })}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <h3 className="text-sm font-bold text-taupe-heading border-b border-taupe-border pb-1 mb-2">総合判定</h3>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setOverallResult('pass')}
            className={
              'px-3 py-1 rounded text-xs border ' +
              (overallResult === 'pass'
                ? 'bg-taupe-heading text-white border-taupe-heading'
                : 'bg-white border-taupe-border text-taupe-body')
            }
          >
            合格
          </button>
          <button
            type="button"
            onClick={() => setOverallResult('needs_improvement')}
            className={
              'px-3 py-1 rounded text-xs border ' +
              (overallResult === 'needs_improvement'
                ? 'bg-taupe-ng text-white border-taupe-ng'
                : 'bg-white border-taupe-border text-taupe-body')
            }
          >
            要改善
          </button>
        </div>
        <textarea
          className="w-full border border-taupe-border rounded px-2 py-1.5 text-sm"
          rows={2}
          placeholder="コメント"
          value={overallComment}
          onChange={(e) => setOverallComment(e.target.value)}
        />
      </div>

      {!allAnswered && (
        <p className="text-xs text-taupe-ng">すべての項目にOK/NGを記入してください。</p>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-1.5 rounded text-sm border border-taupe-border text-taupe-body">
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-4 py-1.5 rounded text-sm bg-taupe-title text-white disabled:opacity-40"
        >
          {saving ? '保存中…' : '保存する'}
        </button>
      </div>
    </div>
  );
}
