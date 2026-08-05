-- aboutus-food-qc v2: 「フードメニューQCログ」設計への全面差し替え
-- 旧テーブル（工程別チェックリスト方式）は使用実績がないため削除し、
-- 不具合レポート方式（店舗・メニュー・提供/廃棄・推測要因・お手本ライブラリ）に切り替える。
-- Supabase SQL Editor でこの内容を実行してください。

-- ============ 旧テーブル削除 ============
drop table if exists qc_check_results;
drop table if exists qc_process_media;
drop table if exists qc_checks;
drop table if exists qc_checklist_items;
drop table if exists qc_staff;
drop table if exists qc_products;

-- ============ 新テーブル ============

create table qc_entries (
  id bigint generated always as identity primary key,
  store text not null,
  category text not null,
  dish_name text not null,
  date date not null,
  found_date date not null,
  maker text not null,
  checker text not null default '',
  checker_comment text not null default '',
  disposition text not null, -- '提供' | '廃棄'
  cause text not null,
  media_url text,
  media_name text,
  media_type text, -- 'image' | 'video'
  note text not null default '',
  created_at timestamptz not null default now()
);

create table qc_reference_library (
  id bigint generated always as identity primary key,
  dish_name text unique not null,
  photo_url text,
  photo_name text,
  video_url text not null default '',
  points text not null default '',
  updated_at date
);

-- ============ RLS（他アプリと同方針：open、制御はアプリ側） ============

alter table qc_entries enable row level security;
alter table qc_reference_library enable row level security;

drop policy if exists "qc_entries open" on qc_entries;
create policy "qc_entries open" on qc_entries for all using (true) with check (true);

drop policy if exists "qc_reference_library open" on qc_reference_library;
create policy "qc_reference_library open" on qc_reference_library for all using (true) with check (true);

-- ストレージは既存の qc-photos バケットをそのまま使う（画像・動画とも対応）
