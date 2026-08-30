-- aboutus-food-qc v4: お手本ポイントに「仕込み／提供」の区別を追加
-- 同じ商品名でも、仕込み工程用のポイントと提供（盛り付け）確認用のポイントを
-- 別リストとして管理できるようにする。
-- Supabase SQL Editor でこの内容を実行してください。

alter table qc_reference_points
  add column if not exists purpose text not null default 'prep';
-- 'prep' = 仕込み, 'serving' = 提供
-- 既存データ（工程別の仕込みポイント）は自動的に 'prep' として扱われる
