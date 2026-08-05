# aboutus-food-qc

フードメニューの不具合・仕込みミスを記録する「QCログ」アプリ。React + Vite + Supabase。
伏見・二条の両店舗共通で使用。

aboutus-staff-todo / aboutus-beans-profile とは独立したアプリ。Supabaseプロジェクトのみ共有（テーブルは独立）。
記録保存時にaboutus-staff-todoの`notifications`テーブルへ通知を1件insertし、松田夕奈さんに通知が届く。

## セットアップ（初回のみ・手動）

1. **Supabaseにテーブルを作成**
   Supabase SQL Editorで [`scripts/migration_v2_incident_log.sql`](scripts/migration_v2_incident_log.sql) の内容を実行する（旧テーブルの削除＋新テーブルqc_entries/qc_reference_libraryの作成）。

2. **ローカル動作確認**
   ```bash
   npm install
   npm run dev
   ```
   `.env` はすでに用意済み（既存Supabaseプロジェクトの接続情報＋管理者PIN）。

3. **GitHubリポジトリ・Pages・Secrets**（既に設定済みならスキップ）
   - Secrets: `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_MANAGER_PIN`

## 使い方

- **新規記録**：カテゴリ→メニュー→店舗を選び、必須項目（記録作成日・問題発生日・作った人・提供/廃棄・推測要因）と任意項目（確認者名・コメント・写真or動画・総合メモ）を入力して保存
- **履歴**：店舗・カテゴリ・メニュー・日付で絞り込み、記録をタップして詳細（お手本との比較含む）を確認・削除
- **お手本**：メニューごとのお手本写真・動画リンク・要点メモを閲覧。編集は管理者PIN（`.env`の`VITE_MANAGER_PIN`）でロック

## データ構造

- `qc_entries` — QCログ1件（店舗・カテゴリ・メニュー名・日付・問題発生日・作った人・確認者・提供/廃棄・推測要因・写真or動画・総合メモ）
- `qc_reference_library` — メニューごとのお手本（写真・動画リンク・要点メモ）。`dish_name`がユニークキー

画像・動画は既存のSupabase Storageバケット`qc-photos`に保存（`entries/`と`reference/`のフォルダに分離）。
