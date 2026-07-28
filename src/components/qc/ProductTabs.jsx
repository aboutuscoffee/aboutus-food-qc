export default function ProductTabs({ products, activeKey, onSelect }) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
      {products
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((p) => {
          const active = p.key === activeKey;
          return (
            <button
              key={p.key}
              onClick={() => onSelect(p.key)}
              className={
                'shrink-0 px-3 py-1.5 rounded-full text-sm border transition-colors ' +
                (active
                  ? 'bg-taupe-title text-white border-taupe-title'
                  : 'bg-white text-taupe-body border-taupe-border')
              }
            >
              {p.name}
            </button>
          );
        })}
    </div>
  );
}
