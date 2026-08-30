import { supabase } from './supabase';
import { NOTIFY_STAFF_KEY } from './constants';

export async function fetchAll() {
  const [entries, referencePoints, referencePointMedia] = await Promise.all([
    supabase.from('qc_entries').select('*').order('date', { ascending: false }),
    supabase.from('qc_reference_points').select('*').order('sort_order'),
    supabase.from('qc_reference_point_media').select('*').order('sort_order'),
  ]);

  for (const res of [entries, referencePoints, referencePointMedia]) {
    if (res.error) throw new Error(res.error.message);
  }

  return {
    entries: entries.data ?? [],
    referencePoints: referencePoints.data ?? [],
    referencePointMedia: referencePointMedia.data ?? [],
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

export async function uploadPointMedia(file) {
  const url = await uploadMedia('reference-points', file);
  const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
  return { url, name: file.name, type: mediaType };
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

export async function savePoint(fields) {
  const { id, ...rest } = fields;
  if (id != null) {
    const { data, error } = await supabase.from('qc_reference_points').update(rest).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
  const { data, error } = await supabase.from('qc_reference_points').insert(rest).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePoint(id) {
  const { error } = await supabase.from('qc_reference_points').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addPointMedia(pointId, file) {
  const uploaded = await uploadPointMedia(file);
  const { data, error } = await supabase
    .from('qc_reference_point_media')
    .insert({ point_id: pointId, media_type: uploaded.type, media_url: uploaded.url, media_name: uploaded.name })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePointMedia(id) {
  const { error } = await supabase.from('qc_reference_point_media').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addPointLink(pointId, url) {
  const { data, error } = await supabase
    .from('qc_reference_point_media')
    .insert({ point_id: pointId, media_type: 'link', media_url: url, media_name: url })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
