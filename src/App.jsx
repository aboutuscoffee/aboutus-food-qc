import { useCallback, useEffect, useState } from 'react';
import { fetchAll, upsertItem, deleteItem, saveCheck, uploadReferenceImage } from './lib/db';
import ProductTabs from './components/qc/ProductTabs';
import ProductPanel from './components/qc/ProductPanel';
import StaffManager from './components/qc/StaffManager';
import Spinner from './components/common/Spinner';

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [productKey, setProductKey] = useState(null);
  const [showStaffManager, setShowStaffManager] = useState(false);

  useEffect(() => {
    fetchAll()
      .then((d) => {
        setData(d);
        if (d.products.length > 0) setProductKey(d.products[0].key);
      })
      .catch((e) => setError(e.message));
  }, []);

  const onSaveCheck = useCallback(async (checkFields, itemResults) => {
    const { check, results } = await saveCheck(checkFields, itemResults);
    setData((d) => ({
      ...d,
      checks: [check, ...d.checks],
      results: [...d.results, ...results],
    }));
  }, []);

  const onUploadReferenceImage = useCallback(async (product, file) => {
    const url = await uploadReferenceImage(product.key, file);
    const saved = await upsertItem('qc_products', {
      id: product.id,
      reference_image_url: url,
      reference_image_name: file.name,
    });
    setData((d) => ({
      ...d,
      products: d.products.map((p) => (p.id === saved.id ? saved : p)),
    }));
  }, []);

  const onAddStaff = useCallback(async (name) => {
    const saved = await upsertItem('qc_staff', {
      name,
      sort_order: (data?.staff.length ?? 0) + 1,
      active: true,
    });
    setData((d) => ({ ...d, staff: [...d.staff, saved] }));
  }, [data]);

  const onToggleStaffActive = useCallback(async (staffMember) => {
    const saved = await upsertItem('qc_staff', { id: staffMember.id, active: !staffMember.active });
    setData((d) => ({ ...d, staff: d.staff.map((s) => (s.id === saved.id ? saved : s)) }));
  }, []);

  const onDeleteStaff = useCallback(async (id) => {
    await deleteItem('qc_staff', id);
    setData((d) => ({ ...d, staff: d.staff.filter((s) => s.id !== id) }));
  }, []);

  if (error) {
    return <div className="p-6 text-taupe-ng">読み込みエラー：{error}</div>;
  }
  if (!data) {
    return <Spinner />;
  }

  const product = data.products.find((p) => p.key === productKey);

  return (
    <div className="min-h-screen bg-taupe-bg text-taupe-body">
      <header className="px-4 pt-5 pb-3 border-b border-taupe-border">
        <h1 className="text-lg font-bold text-taupe-title">フード仕込み QCチェック</h1>
        <button
          className="text-xs text-taupe-subtitle underline mt-1"
          onClick={() => setShowStaffManager((v) => !v)}
        >
          {showStaffManager ? '← チェックに戻る' : 'スタッフ名簿を管理'}
        </button>
      </header>

      <main className="px-4 py-4 max-w-2xl mx-auto">
        {showStaffManager ? (
          <StaffManager
            staff={data.staff}
            onAdd={onAddStaff}
            onToggleActive={onToggleStaffActive}
            onDelete={onDeleteStaff}
          />
        ) : (
          <>
            <ProductTabs products={data.products} activeKey={productKey} onSelect={setProductKey} />
            {product && (
              <ProductPanel
                key={product.id}
                product={product}
                items={data.items}
                checks={data.checks}
                results={data.results}
                staff={data.staff}
                onSaveCheck={onSaveCheck}
                onUploadReferenceImage={onUploadReferenceImage}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
