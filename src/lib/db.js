import { supabase } from './supabase';

export async function fetchAll() {
  const [products, items, staff, checks, results] = await Promise.all([
    supabase.from('qc_products').select('*').order('sort_order'),
    supabase.from('qc_checklist_items').select('*').order('sort_order'),
    supabase.from('qc_staff').select('*').order('sort_order'),
    supabase.from('qc_checks').select('*').order('check_date', { ascending: false }),
    supabase.from('qc_check_results').select('*'),
  ]);

  for (const res of [products, items, staff, checks, results]) {
    if (res.error) throw new Error(res.error.message);
  }

  return {
    products: products.data ?? [],
    items: items.data ?? [],
    staff: staff.data ?? [],
    checks: checks.data ?? [],
    results: results.data ?? [],
  };
}

export async function upsertItem(table, item, pk = 'id') {
  const idVal = item[pk];
  if (idVal != null) {
    const { [pk]: _omit, ...fields } = item;
    const { data, error } = await supabase.from(table).update(fields).eq(pk, idVal).select();
    if (error) throw new Error(error.message);
    if (data && data.length > 0) return data[0];
    const { data: inserted, error: insertError } = await supabase.from(table).insert(item).select().single();
    if (insertError) throw new Error(insertError.message);
    return inserted;
  }
  const { data, error } = await supabase.from(table).insert(item).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteItem(table, id, pk = 'id') {
  const { error } = await supabase.from(table).delete().eq(pk, id);
  if (error) throw new Error(error.message);
}

// チェック1回分（ヘッダー + 項目ごとの結果）をまとめて保存する
export async function saveCheck(checkFields, itemResults) {
  const { data: check, error: checkError } = await supabase
    .from('qc_checks')
    .insert(checkFields)
    .select()
    .single();
  if (checkError) throw new Error(checkError.message);

  const rows = itemResults.map((r) => ({ ...r, check_id: check.id }));
  const { data: results, error: resultsError } = await supabase
    .from('qc_check_results')
    .insert(rows)
    .select();
  if (resultsError) throw new Error(resultsError.message);

  return { check, results };
}

// Supabase Storage rejects object keys containing non-ASCII characters (e.g. Japanese filenames),
// so the storage path uses only the file extension; the original name is kept separately for display.
function safeExt(filename) {
  const m = /\.[a-zA-Z0-9]+$/.exec(filename);
  return m ? m[0].toLowerCase() : '';
}

export async function uploadReferenceImage(productKey, file) {
  const path = `${productKey}/${Date.now()}${safeExt(file.name)}`;
  const { error } = await supabase.storage.from('qc-photos').upload(path, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('qc-photos').getPublicUrl(path);
  return data.publicUrl;
}
