import { useState } from 'react';
import ReferenceImage from './ReferenceImage';
import CheckForm from './CheckForm';
import CheckHistoryList from './CheckHistoryList';
import CheckDetail from './CheckDetail';
import { itemsForProduct, checksForProduct, resultsForCheck } from '../../lib/selectors';

export default function ProductPanel({
  product,
  items,
  checks,
  results,
  staff,
  onSaveCheck,
  onUploadReferenceImage,
}) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCheckId, setSelectedCheckId] = useState(null);

  const productItems = itemsForProduct(items, product.id);
  const productChecks = checksForProduct(checks, product.id);
  const selectedCheck = productChecks.find((c) => c.id === selectedCheckId) ?? productChecks[0] ?? null;

  return (
    <div>
      <ReferenceImage product={product} onUpload={onUploadReferenceImage} />

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-4 py-2.5 rounded-lg bg-taupe-title text-white text-sm font-medium"
        >
          ＋ 新規チェックを記録
        </button>
      )}

      {showForm && (
        <div className="mb-4">
          <CheckForm
            product={product}
            items={productItems}
            staff={staff}
            onSave={onSaveCheck}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <h2 className="text-sm font-bold text-taupe-heading mb-2">チェック履歴</h2>
      <CheckHistoryList
        checks={productChecks}
        staff={staff}
        selectedId={selectedCheck?.id}
        onSelect={setSelectedCheckId}
      />

      {selectedCheck && (
        <div className="mt-3">
          <CheckDetail
            check={selectedCheck}
            items={productItems}
            results={resultsForCheck(results, selectedCheck.id)}
            staff={staff}
          />
        </div>
      )}
    </div>
  );
}
