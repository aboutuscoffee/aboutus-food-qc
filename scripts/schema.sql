-- aboutus-food-qc: スキーマ + 初期データ
-- Supabase SQL Editor でこのファイルの内容をそのまま実行してください。
-- 既存プロジェクト（wejzwflqswvqepvhruic）に新規テーブルを追加します。他アプリのテーブルとは無関係です。

-- ============ テーブル ============

create table if not exists qc_products (
  id bigint generated always as identity primary key,
  key text unique not null,
  name text not null,
  reference_image_url text,
  reference_image_name text,
  sort_order int not null default 0
);

create table if not exists qc_checklist_items (
  id bigint generated always as identity primary key,
  product_id bigint not null references qc_products(id) on delete cascade,
  process_name text not null,
  item_name text not null,
  criteria_text text not null default '',
  ng_example_text text not null default '',
  sort_order int not null default 0
);

create table if not exists qc_staff (
  id bigint generated always as identity primary key,
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists qc_checks (
  id bigint generated always as identity primary key,
  product_id bigint not null references qc_products(id) on delete cascade,
  staff_id bigint references qc_staff(id),
  checked_by_name text not null default '',
  check_date date not null default current_date,
  overall_result text not null default 'pass',
  overall_comment text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists qc_check_results (
  id bigint generated always as identity primary key,
  check_id bigint not null references qc_checks(id) on delete cascade,
  checklist_item_id bigint not null references qc_checklist_items(id),
  result text not null default 'ok',
  comment text not null default ''
);

-- ============ RLS（他アプリと同方針：全テーブルopen、制御はアプリ側） ============

alter table qc_products enable row level security;
alter table qc_checklist_items enable row level security;
alter table qc_staff enable row level security;
alter table qc_checks enable row level security;
alter table qc_check_results enable row level security;

drop policy if exists "qc_products open" on qc_products;
create policy "qc_products open" on qc_products for all using (true) with check (true);

drop policy if exists "qc_checklist_items open" on qc_checklist_items;
create policy "qc_checklist_items open" on qc_checklist_items for all using (true) with check (true);

drop policy if exists "qc_staff open" on qc_staff;
create policy "qc_staff open" on qc_staff for all using (true) with check (true);

drop policy if exists "qc_checks open" on qc_checks;
create policy "qc_checks open" on qc_checks for all using (true) with check (true);

drop policy if exists "qc_check_results open" on qc_check_results;
create policy "qc_check_results open" on qc_check_results for all using (true) with check (true);

-- ============ Storage（お手本写真） ============

insert into storage.buckets (id, name, public)
values ('qc-photos', 'qc-photos', true)
on conflict (id) do nothing;

drop policy if exists "qc-photos public read" on storage.objects;
create policy "qc-photos public read" on storage.objects for select using (bucket_id = 'qc-photos');

drop policy if exists "qc-photos anon insert" on storage.objects;
create policy "qc-photos anon insert" on storage.objects for insert with check (bucket_id = 'qc-photos');

drop policy if exists "qc-photos anon update" on storage.objects;
create policy "qc-photos anon update" on storage.objects for update using (bucket_id = 'qc-photos');

drop policy if exists "qc-photos anon delete" on storage.objects;
create policy "qc-photos anon delete" on storage.objects for delete using (bucket_id = 'qc-photos');

-- ============ 初期データ：3商品 ============

insert into qc_products (key, name, sort_order) values
  ('raisin-butter-sand', 'レーズンバターサンド', 1),
  ('cassata', 'カッサータ', 2),
  ('basque-cheesecake', '紅茶バスクチーズケーキ', 3)
on conflict (key) do nothing;

-- ============ 初期データ：チェック項目 ============

-- ① レーズンバターサンド
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程1：バタークリーム作り', '泡立て具合（色・ツヤ）', '生クリームの泡立て前くらいの白さ・ツヤ', '黄色っぽい＝泡立て不足', 1
from qc_products where key = 'raisin-butter-sand';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程1：バタークリーム作り', '硬さ・温度（触感の目安）', 'ゴムベラで持ち上げると角が立つが、お辞儀するくらいの柔らかさ', 'だら〜っと流れる＝緩すぎ（温度高い）／持ち上げても形が変わらない＝硬すぎ（冷やしすぎ）', 2
from qc_products where key = 'raisin-butter-sand';

insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：絞り・挟み', 'クリーム量', 'レシピ分量通り', '目分量でのばらつきに注意', 3
from qc_products where key = 'raisin-butter-sand';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：絞り・挟み', '挟んだときの厚み', 'ダックワーズ2枚＋クリームで約4cm', '押しすぎ＝薄すぎ／軽く合わせすぎ＝形が不揃い・崩れやすい', 4
from qc_products where key = 'raisin-butter-sand';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：絞り・挟み', '見た目', 'クリームがはみ出さず均一', '押しすぎ・押さなすぎで断面が不揃い', 5
from qc_products where key = 'raisin-butter-sand';

insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程3：個包装・冷凍保存', 'ダックワーズの湿り', '挟んだ直後に確認し、ダックワーズがサクッとした状態を保っている（湿っていない）', 'クリームの水分でダックワーズがしっとり・べたついている＝時間を置きすぎ', 6
from qc_products where key = 'raisin-butter-sand';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程3：個包装・冷凍保存', '包装', '破れ・液漏れがない、袋が正しく閉じている', '', 7
from qc_products where key = 'raisin-butter-sand';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程3：個包装・冷凍保存', '保存', '冷凍保存', '', 8
from qc_products where key = 'raisin-butter-sand';

-- ② カッサータ
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程1：土台（クッキー生地）', '砕き具合', 'クッキー＋ココナッツが細かく均一に砕けている', '', 1
from qc_products where key = 'cassata';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程1：土台（クッキー生地）', '敷き詰め', '型底にシートを敷き、均一な厚さで敷き詰められている', '', 2
from qc_products where key = 'cassata';

insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：チーズベース作り', 'クリームチーズの状態', 'レンジ後、ヘラでダマがなく滑らかに潰せている', 'ダマが残る＝温め不足・混ぜ不足', 3
from qc_products where key = 'cassata';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：チーズベース作り', '生地の硬さ', '「少し固めで止める」の指示通り、緩めすぎない', '緩すぎる＝温めすぎ', 4
from qc_products where key = 'cassata';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：チーズベース作り', 'マスカルポーネ・砂糖・はちみつ・コアントロー', 'ムラなく均一に混ざっている', '', 5
from qc_products where key = 'cassata';

insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程3：生クリーム立て〜合わせ　★最重要', '生クリームの泡立て具合', '六分立て（すくうとトロッと流れ落ちるが、跡が少し残る程度）', '立て不足＝ゆるすぎてコシがない→かさが出ない／立てすぎ＝もったり重くなる', 6
from qc_products where key = 'cassata';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程3：生クリーム立て〜合わせ　★最重要', 'ゼラチンとの馴染ませ方', '生地に少量ずつ加えてダマなく馴染ませる', '一気に加えるとダマになる', 7
from qc_products where key = 'cassata';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程3：生クリーム立て〜合わせ　★最重要', 'クリームとの混ぜ方', '4回に分けて、最低限・全体が均一に混ざればOK（混ぜすぎない）', '必要以上に混ぜる＝泡が潰れてかさが減る（型に入れたとき低くなる原因）', 8
from qc_products where key = 'cassata';

insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程4：型入れ・冷凍', '型に入れたときのかさ', '型の高さ（6cm）まで生地がみちみちに入っている', '4.5cmくらいで少ない＝工程3の泡立て不足or混ぜすぎ', 9
from qc_products where key = 'cassata';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程4：型入れ・冷凍', 'ラズベリーの配置', '見栄え良く並んでいる', '', 10
from qc_products where key = 'cassata';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程4：型入れ・冷凍', '表面', 'ラップをして平らに冷凍', '', 11
from qc_products where key = 'cassata';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程4：型入れ・冷凍', 'カット厚み', '2cm', '厚み不揃い', 12
from qc_products where key = 'cassata';

-- ③ 紅茶バスクチーズケーキ
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程1：生地作り', '紅茶クリーム＋コーンスターチ', 'ダマなく均一に混ざっている', 'ダマが残る＝混ぜ不足', 1
from qc_products where key = 'basque-cheesecake';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程1：生地作り', 'クリームチーズの状態', 'レンジ後、ダマなく滑らかに潰せている', 'ダマが残る＝温め不足・混ぜ不足', 2
from qc_products where key = 'basque-cheesecake';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程1：生地作り', '卵・紅茶クリームを加える工程', '分離せず、都度なめらかに混ざってから次を加える', '一気に加えて分離・ムラになる', 3
from qc_products where key = 'basque-cheesecake';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程1：生地作り', '型入れ前', '生地を濾してから型に入れる（ダマ・気泡除去）', '濾さずダマ・気泡が残る', 4
from qc_products where key = 'basque-cheesecake';

insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：焼成　★最重要', 'オーブン設定', '予熱250℃、焼成29分（13分で天板を反転）', '反転を忘れると焼きムラ', 5
from qc_products where key = 'basque-cheesecake';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：焼成　★最重要', '表面の色', '均一に真っ黒、フチの生地にもしっかり火が入っている', '色が薄い＝焼き不足／均一に真っ黒でない＝ムラ', 6
from qc_products where key = 'basque-cheesecake';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程2：焼成　★最重要', '揺らした時の状態', '型を横に優しく揺すると、中心付近だけプルンと揺れる。フチは揺れない。焦げが割れない', '広い範囲が大きく揺れる＝焼き不足／全く揺れない・硬い＝焼き過ぎ／揺らして焦げが割れる＝焼き過ぎ', 7
from qc_products where key = 'basque-cheesecake';

insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程3：冷却・カット', '冷却', '粗熱・冷蔵でしっかり冷やしてからカット', '温かいうちにカットすると潰れる・不均一になる', 8
from qc_products where key = 'basque-cheesecake';
insert into qc_checklist_items (product_id, process_name, item_name, criteria_text, ng_example_text, sort_order)
select id, '工程3：冷却・カット', 'カット等分', '10等分、大きさが均等', 'カットが不均一', 9
from qc_products where key = 'basque-cheesecake';
