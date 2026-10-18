import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// 写真・動画の拡大表示。写真はピンチ/ホイール/ダブルタップで拡大し、ドラッグで移動できる。
// onReplace を渡すと「写真を変更」ボタンを表示する（記録フォームの添付時のみ使用）。
export default function MediaViewer({ src, type = 'image', caption, onClose, onReplace }) {
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const downOnStage = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;

  const limitPan = (s, x, y) => {
    const el = imgRef.current;
    const w = el ? el.offsetWidth : 0;
    const h = el ? el.offsetHeight : 0;
    const maxX = ((s - 1) * w) / 2;
    const maxY = ((s - 1) * h) / 2;
    return { s, x: s === 1 ? 0 : clamp(x, -maxX, maxX), y: s === 1 ? 0 : clamp(y, -maxY, maxY) };
  };

  const zoomTo = (next) => {
    const s = clamp(Math.round(next * 10) / 10, MIN_SCALE, MAX_SCALE);
    setView((v) => limitPan(s, v.x, v.y));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || type !== 'image') return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      setView((v) => limitPan(clamp(Math.round((v.s + (e.deltaY < 0 ? 0.3 : -0.3)) * 10) / 10, MIN_SCALE, MAX_SCALE), v.x, v.y));
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [type]);

  const dist = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e) => {
    downOnStage.current = e.target === e.currentTarget;
    if (type !== 'image') return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    const v = viewRef.current;
    if (pointers.current.size === 2) {
      gesture.current = { mode: 'pinch', d0: dist(), s0: v.s };
    } else if (pointers.current.size === 1) {
      gesture.current = { mode: 'pan', sx: e.clientX, sy: e.clientY, ox: v.x, oy: v.y };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.mode === 'pinch' && pointers.current.size === 2) {
      const s = clamp(g.s0 * (dist() / g.d0), MIN_SCALE, MAX_SCALE);
      setView((v) => limitPan(s, v.x, v.y));
    } else if (g.mode === 'pan' && viewRef.current.s > 1) {
      setView((v) => limitPan(v.s, g.ox + (e.clientX - g.sx), g.oy + (e.clientY - g.sy)));
    }
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    const v = viewRef.current;
    gesture.current =
      pointers.current.size === 1
        ? (() => {
            const [p] = [...pointers.current.values()];
            return { mode: 'pan', sx: p.x, sy: p.y, ox: v.x, oy: v.y };
          })()
        : null;
  };

  const onDoubleClick = () => {
    setView((v) => (v.s > 1 ? { s: 1, x: 0, y: 0 } : limitPan(2.5, 0, 0)));
  };

  const onStageClick = () => {
    if (downOnStage.current && viewRef.current.s === 1) onClose();
  };

  const percent = Math.round(view.s * 100);

  return createPortal(
    <div className="qcf-viewer" role="dialog" aria-modal="true" aria-label={type === 'image' ? '写真の拡大表示' : '動画の再生'}>
      <div className="qcf-viewer-top">
        <span className="qcf-viewer-caption">{caption}</span>
        <button type="button" className="qcf-viewer-btn qcf-viewer-round" aria-label="閉じる" onClick={onClose}>
          ✕
        </button>
      </div>

      <div
        ref={stageRef}
        className={'qcf-viewer-stage' + (type === 'image' && view.s > 1 ? ' zoomed' : '')}
        onClick={onStageClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {type === 'video' ? (
          <video className="qcf-viewer-media" src={src} controls autoPlay playsInline />
        ) : (
          <img
            ref={imgRef}
            className="qcf-viewer-media"
            src={src}
            alt={caption || ''}
            draggable={false}
            onDoubleClick={onDoubleClick}
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
          />
        )}
      </div>

      <div className="qcf-viewer-bottom">
        {type === 'image' && (
          <>
            <button type="button" className="qcf-viewer-btn qcf-viewer-round" aria-label="縮小" onClick={() => zoomTo(view.s - 0.5)}>
              －
            </button>
            <button type="button" className="qcf-viewer-btn qcf-viewer-pct" aria-label="元のサイズに戻す" onClick={() => zoomTo(1)}>
              {percent}%
            </button>
            <button type="button" className="qcf-viewer-btn qcf-viewer-round" aria-label="拡大" onClick={() => zoomTo(view.s + 0.5)}>
              ＋
            </button>
          </>
        )}
        {onReplace && (
          <button type="button" className="qcf-viewer-btn qcf-viewer-replace" onClick={onReplace}>
            {type === 'image' ? '写真を変更' : '動画を変更'}
          </button>
        )}
      </div>
      {type === 'image' && <div className="qcf-viewer-hint">ダブルタップで拡大・ドラッグで移動・外側タップで閉じる</div>}
    </div>,
    document.body
  );
}
