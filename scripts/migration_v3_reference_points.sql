-- aboutus-food-qc v3: お手本を「工程ごとのポイント＋複数メディア」方式に変更
-- 商品1件に付き写真1枚+動画URL1本+要点メモ1つ、という旧構造(qc_reference_library)を廃止し、
-- 工程ごとに複数のポイント（文章）を持ち、各ポイントに複数の写真/動画を添付できる構造にする。
-- Supabase SQL Editor でこの内容を実行してください。

drop table if exists qc_reference_library;

create table qc_reference_points (
  id bigint generated always as identity primary key,
  dish_name text not null,
  process_name text not null,
  point_text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table qc_reference_point_media (
  id bigint generated always as identity primary key,
  point_id bigint not null references qc_reference_points(id) on delete cascade,
  media_type text not null default 'image', -- 'image' | 'video'
  media_url text not null,
  media_name text,
  sort_order int not null default 0
);

alter table qc_reference_points enable row level security;
alter table qc_reference_point_media enable row level security;

drop policy if exists "qc_reference_points open" on qc_reference_points;
create policy "qc_reference_points open" on qc_reference_points for all using (true) with check (true);

drop policy if exists "qc_reference_point_media open" on qc_reference_point_media;
create policy "qc_reference_point_media open" on qc_reference_point_media for all using (true) with check (true);

-- ストレージは既存の qc-photos バケットをそのまま使う
