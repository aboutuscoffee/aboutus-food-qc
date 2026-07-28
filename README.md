# aboutus-food-qc

フード仕込みのクオリティチェックを記録するアプリ。React + Vite + Tailwind CSS + Supabase。

対象：レーズンバターサンド／カッサータ／紅茶バスクチーズケーキ（`scripts/schema.sql` で追加可能）

aboutus-staff-todo / aboutus-beans-profile とは独立したアプリ。Supabaseプロジェクトのみ共有（テーブルは独立、staffテーブルとは連携しない）。

## セットアップ（初回のみ・手動）

1. **Supabaseにテーブルを作成**
   Supabase SQL Editorで [`scripts/schema.sql`](scripts/schema.sql) の内容を実行する（テーブル・RLS・Storageバケット・初期の商品/チェック項目データが入る）。

2. **ローカル動作確認**
   ```bash
   npm install
   npm run dev
   ```
   `.env` はすでに用意済み（既存Supabaseプロジェクトの接続情報）。

3. **GitHubリポジトリを作成してpush**
   ```bash
   gh repo create aboutuscoffee/aboutus-food-qc --public --source=. --remote=origin
   git push -u origin main
   ```
   （`gh` が無ければGitHub上で手動作成してリモート追加）

4. **GitHub Pagesを有効化**
   リポジトリの Settings → Pages → Source を「GitHub Actions」に設定。

5. **GitHub Secretsを設定**
   Settings → Secrets and variables → Actions で以下を追加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   （値は `.env` と同じ）

6. mainにpushすると自動デプロイされ、`https://aboutuscoffee.github.io/aboutus-food-qc/` で公開される。

## 使い方

- 商品タブを選んで「＋ 新規チェックを記録」→ 担当者・チェック者を選び、項目ごとにOK/NGとコメントを記入して保存
- 商品ごとに「完成理想図」（お手本写真）を1枚登録できる（差し替え可能）
- 「スタッフ名簿を管理」から担当者の追加・無効化ができる
- チェック履歴は日付ピルから選んで詳細を確認できる

## データ構造

- `qc_products` — 商品マスタ（お手本写真URL含む）
- `qc_checklist_items` — 商品ごとのチェック項目マスタ（工程名・合格基準・NG例）
- `qc_staff` — 担当者名簿（このアプリ専用、staff-todoとは別）
- `qc_checks` — チェック1回分のヘッダー（商品・担当者・チェック者・日付・総合判定）
- `qc_check_results` — チェック1回分の項目ごとの結果（OK/NG・コメント）

`qc_checks`と`qc_check_results`が正規化されているため、将来「担当者ごとのNG傾向」等の集計画面を追加しやすい構造になっている。
