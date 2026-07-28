import { useRef, useState } from 'react';

export default function ReferenceImage({ product, onUpload }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    Promise.resolve(onUpload(product, file)).finally(() => setUploading(false));
  };

  return (
    <div className="mb-4 rounded-lg overflow-hidden border border-taupe-border bg-white">
      {product.reference_image_url ? (
        <img
          src={product.reference_image_url}
          alt={`${product.name} お手本`}
          className="w-full max-h-72 object-contain bg-taupe-header"
        />
      ) : (
        <div className="h-32 flex items-center justify-center text-taupe-subtitle text-sm">
          お手本写真が未登録です
        </div>
      )}
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-taupe-subtitle">完成理想図</span>
        <button
          className="text-xs text-taupe-heading underline disabled:opacity-50"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'アップロード中…' : product.reference_image_url ? '写真を差し替え' : '写真を登録'}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}
