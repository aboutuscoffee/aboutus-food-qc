import { useState } from 'react';
import { STORES, CATEGORIES, MENUS, purposeForCategory } from '../../lib/constants';
import { pointsForDish } from '../../lib/selectors';
import ReferencePointsView from './ReferencePointsView';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyDraft() {
  return {
    date: today(),
    store: STORES[0],
    category: '',
    dishName: '',
    checker: '',
    checkerComment: '',
    foundDate: '',
    maker: '',
    disposition: '',
    cause: '',
    note: '',
  };
}

export default function NewEntryForm({ referencePoints, referencePointMedia, onUploadMedia, onSave, showToast }) {
  const [draft, setDraft] = useState(emptyDraft());
  const [media, setMedia] = useState(null); // { file, previewUrl, type }
  const [refPanelOpen, setRefPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const menuOpts = MENUS[draft.category] || [];
  const refPurpose = purposeForCategory(draft.category);
  const dishPoints = pointsForDish(referencePoints, draft.dishName, refPurpose);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMedia({ file, previewUrl: type === 'image' ? URL.createObjectURL(file) : null, type, name: file.name });
  };

  const handleSave = async () => {
    const missing = [];
    if (!draft.category) missing.push('カテゴリ');
    if (!draft.store) missing.push('店舗');
    if (!draft.dishName) missing.push('メニュー名');
    if (!draft.date) missing.push('記録作成日');
    if (!draft.foundDate) missing.push('問題発生日');
    if (!draft.maker.trim()) missing.push('作った人');
    if (!draft.disposition) missing.push('提供 / 廃棄 / 保管中');
    if (!draft.cause.trim()) missing.push('推測できる要因');
    if (missing.length > 0) {
      showToast('必須項目を入力してください：' + missing.join('・'), true);
      return;
    }

    setSaving(true);
    try {
      let mediaFields = { media_url: null, media_name: null, media_type: null };
      if (media) {
        const uploaded = await onUploadMedia(media.file);
        mediaFields = { media_url: uploaded.url, media_name: uploaded.name, media_type: uploaded.type };
      }
      await onSave({
        store: draft.store,
        category: draft.category,
        dish_name: draft.dishName,
        date: draft.date,
        found_date: draft.foundDate,
        maker: draft.maker.trim(),
        checker: draft.checker.trim(),
        checker_comment: draft.checkerComment.trim(),
        disposition: draft.disposition,
        cause: draft.cause.trim(),
        note: draft.note.trim(),
        ...mediaFields,
      });
      showToast('記録を保存しました。', false);
      setDraft(emptyDraft());
      setMedia(null);
      setRefPanelOpen(false);
    } catch (e) {
      showToast('保存に失敗しました：' + e.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <p className="qcf-section-title" style={{ marginTop: 0 }}>
        メニュー選択<span className="qcf-req-mark">※カテゴリを選ぶとメニューが表示されます</span>
      </p>

      <div className="qcf-req-grid" style={{ marginBottom: 10 }}>
        <div className="qcf-field">
          <label>
            カテゴリ<span className="qcf-req-mark">*</span>
          </label>
          <select
            value={draft.category}
            onChange={(e) => {
              set('category', e.target.value);
              set('dishName', '');
              setRefPanelOpen(false);
            }}
          >
            <option value="">選択してください</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="qcf-field">
          <label>
            メニュー名<span className="qcf-req-mark">*</span>
          </label>
          <select
            value={draft.dishName}
            disabled={menuOpts.length === 0}
            onChange={(e) => {
              set('dishName', e.target.value);
              setRefPanelOpen(false);
            }}
          >
            <option value="">選択してください</option>
            {menuOpts.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="qcf-field">
          <label>
            店舗<span className="qcf-req-mark">*</span>
          </label>
          <select value={draft.store} onChange={(e) => set('store', e.target.value)}>
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="qcf-field">
          <label>確認者名</label>
          <input type="text" placeholder="確認者名" value={draft.checker} onChange={(e) => set('checker', e.target.value)} />
        </div>
      </div>
      <div className="qcf-field" style={{ marginTop: 10 }}>
        <label>確認者コメント</label>
        <textarea rows={2} placeholder="確認者からのコメント・指示など" value={draft.checkerComment} onChange={(e) => set('checkerComment', e.target.value)} />
      </div>

      {dishPoints.length > 0 && (
        <>
          <div className="qcf-ref-toggle" onClick={() => setRefPanelOpen((v) => !v)}>
            <span className="qcf-ref-toggle-label">お手本を見る（工程ごとのポイント）</span>
            <span className="qcf-chevron">{refPanelOpen ? '▲' : '▼'}</span>
          </div>
          {refPanelOpen && (
            <div style={{ border: '0.5px solid var(--line)', borderRadius: 8, padding: 10, marginBottom: 12, background: '#fff' }}>
              <ReferencePointsView dishName={draft.dishName} purpose={refPurpose} points={referencePoints} media={referencePointMedia} isManager={false} />
            </div>
          )}
        </>
      )}

      <p className="qcf-section-title">
        必須項目<span className="qcf-req-mark">※すべて入力してください</span>
      </p>
      <div className="qcf-req-box">
        <div className="qcf-req-grid">
          <div className="qcf-field">
            <label>
              記録作成日<span className="qcf-req-mark">*</span>
            </label>
            <input type="date" value={draft.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="qcf-field">
            <label>
              問題発生に気付いた日付<span className="qcf-req-mark">*</span>
            </label>
            <input type="date" value={draft.foundDate} onChange={(e) => set('foundDate', e.target.value)} />
          </div>
          <div className="qcf-field">
            <label>
              作った人<span className="qcf-req-mark">*</span>
            </label>
            <input type="text" placeholder="担当者名" value={draft.maker} onChange={(e) => set('maker', e.target.value)} />
          </div>
          <div className="qcf-field">
            <label>
              提供 / 廃棄 / 保管中<span className="qcf-req-mark">*</span>
            </label>
            <div className="qcf-toggle-group">
              {['提供', '廃棄', '保管中'].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={'qcf-toggle-opt' + (draft.disposition === v ? ' active-' + v : '')}
                  onClick={() => set('disposition', v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="qcf-field">
            <label htmlFor="qcf-media-input">写真または動画</label>
            <label className="qcf-media-zone" htmlFor="qcf-media-input">
              {media ? (
                media.type === 'image' ? (
                  <>
                    <img className="qcf-media-thumb" src={media.previewUrl} />
                    <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>{media.name}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>🎬</div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{media.name}</div>
                  </>
                )
              ) : (
                <>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>タップしてファイルを選択</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>写真・動画に対応</div>
                </>
              )}
            </label>
            <input id="qcf-media-input" type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleMediaChange} />
          </div>
        </div>
        <div className="qcf-field">
          <label>
            推測できる要因<span className="qcf-req-mark">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="例）仕込み温度のズレ、食材の状態不良、盛り付け手順の誤り"
            value={draft.cause}
            onChange={(e) => set('cause', e.target.value)}
          />
        </div>
      </div>

      <div className="qcf-memo-field">
        <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-soft)', marginBottom: 4 }}>総合メモ</label>
        <textarea rows={2} placeholder="全体を通しての所感・改善点" value={draft.note} onChange={(e) => set('note', e.target.value)} />
      </div>

      <button type="button" className="qcf-save-btn" disabled={saving} onClick={handleSave}>
        {saving ? '保存中…' : '記録を保存'}
      </button>
      <p className="qcf-note">保存したデータは伏見・二条の全スタッフと共有されます</p>
    </>
  );
}
