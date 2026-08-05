import { supabase } from './supabase';
import { NOTIFY_STAFF_KEY } from './constants';

export async function fetchAll() {
  const [entries, referenceLibrary] = await Promise.all([
    supabase.from('qc_entries').select('*').order('date', { ascending: false }),
    supabase.from('qc_reference_library').select('*'),
  ]);

  for (const res of [entries, referenceLibrary]) {
    if (res.error) throw new Error(res.error.message);
  }

  return {
    entries: entries.data ?? [],
    referenceLibrary: referenceLibrary.data ?? [],
  };
}

// Supabase Storage rejects object keys containing non-ASCII characters (e.g. Japanese filenames),
// so the storage path uses only the file extension; the original name is kept separately for display.
function safeExt(filename) {
  const m = /\.[a-zA-Z0-9]+$/.exec(filename);
  return m ? m[0].toLowerCase() : '';
}

async function uploadMedia(folder, file) {
  const path = `${folder}/${Date.now()}${safeExt(file.name)}`;
  const { error } = await supabase.storage.from('qc-photos').upload(path, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('qc-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadEntryMedia(file) {
  const url = await uploadMedia('entries', file);
  const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
  return { url, name: file.name, type: mediaType };
}

export async function uploadReferencePhoto(file) {
  const url = await uploadMedia('reference', file);
  return { url, name: file.name };
}

export async function saveEntry(entry) {
  const { data, error } = await supabase.from('qc_entries').insert(entry).select().single();
  if (error) throw new Error(error.message);

  // aboutus-staff-todo と共有しているSupabaseの notifications テーブルに通知を1件insertする
  // （通知に失敗してもチェック記録自体は保存済みなので、ここではエラーを投げない）
  const message = `[${entry.store}] ${entry.dish_name} のQCログが保存されました（${entry.disposition}）`;
  const { error: notifyError } = await supabase.from('notifications').insert({
    staff_key: NOTIFY_STAFF_KEY,
    type: 'qc_log',
    message,
    read: false,
  });
  if (notifyError) console.error('notification insert failed:', notifyError.message);

  return data;
}

export async function deleteEntry(id) {
  const { error } = await supabase.from('qc_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function saveReferenceItem(dishName, fields) {
  const { data, error } = await supabase
    .from('qc_reference_library')
    .upsert({ dish_name: dishName, ...fields }, { onConflict: 'dish_name' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
