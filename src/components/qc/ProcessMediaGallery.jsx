import { useRef, useState } from 'react';

export default function ProcessMediaGallery({ media, onUpload, onDelete }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    Promise.resolve(onUpload(file)).finally(() => setUploading(false));
  };

  return (
    <div className="mb-2">
      {media.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-1.5 pb-1">
          {media.map((m) => (
            <div key={m.id} className="relative shrink-0 w-24 h-24 rounded border border-taupe-border overflow-hidden bg-white">
              {m.media_type === 'video' ? (
                <video src={m.media_url} className="w-full h-full object-cover" controls />
              ) : (
                <img src={m.media_url} alt={m.media_name ?? 'お手本'} className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => onDelete(m.id)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-taupe-body/70 text-white text-xs leading-5"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        className="text-xs text-taupe-heading underline disabled:opacity-50"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'アップロード中…' : '＋ この工程にお手本（画像/動画）を追加'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,video/mp4,video/quicktime"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
