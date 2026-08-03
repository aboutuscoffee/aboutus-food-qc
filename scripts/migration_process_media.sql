-- aboutus-food-qc: 工程ごとのお手本メディア（画像/動画）追加
-- Supabase SQL Editor でこのファイルの内容を実行してください。

create table if not exists qc_process_media (
  id bigint generated always as identity primary key,
  product_id bigint not null references qc_products(id) on delete cascade,
  process_name text not null,
  media_type text not null default 'image', -- 'image' | 'video'
  media_url text not null,
  media_name text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table qc_process_media enable row level security;

drop policy if exists "qc_process_media open" on qc_process_media;
create policy "qc_process_media open" on qc_process_media for all using (true) with check (true);

-- ストレージは既存の qc-photos バケット（画像/動画とも保存可能）をそのまま使う
