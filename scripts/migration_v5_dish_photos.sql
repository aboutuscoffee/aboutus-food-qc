-- aboutus-food-qc v5: お手本に商品ごとの完成写真（サムネイル）を追加
-- Supabase SQL Editor で実行してください。

create table if not exists qc_reference_dish_photos (
  id bigint generated always as identity primary key,
  dish_name text not null,
  purpose text not null default 'prep', -- 'prep' | 'serving'
  media_url text not null,
  media_name text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table qc_reference_dish_photos enable row level security;
drop policy if exists "qc_reference_dish_photos open" on qc_reference_dish_photos;
create policy "qc_reference_dish_photos open" on qc_reference_dish_photos for all using (true) with check (true);
