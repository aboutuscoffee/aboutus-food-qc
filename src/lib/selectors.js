export function itemsForProduct(items, productId) {
  return items
    .filter((i) => i.product_id === productId)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function groupByProcess(items) {
  const groups = [];
  for (const item of items) {
    let g = groups.find((g) => g.process_name === item.process_name);
    if (!g) {
      g = { process_name: item.process_name, items: [] };
      groups.push(g);
    }
    g.items.push(item);
  }
  return groups;
}

export function checksForProduct(checks, productId) {
  return checks
    .filter((c) => c.product_id === productId)
    .slice()
    .sort((a, b) => (a.check_date < b.check_date ? 1 : -1));
}

export function resultsForCheck(results, checkId) {
  return results.filter((r) => r.check_id === checkId);
}

export function activeStaff(staff) {
  return staff
    .filter((s) => s.active)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function staffName(staff, staffId) {
  return staff.find((s) => s.id === staffId)?.name ?? '（不明）';
}
