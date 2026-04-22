# SPEC.md -- GeniusMap 仕様書

> このファイルを読んだ Claude Code が人間の助けなしに実装できるレベルの詳細を記載する。
> 曖昧な記述は禁止。「〜などを実装」「適宜対応」は書かない。

---

## 概要

**プロダクト名**: GeniusMap
**解決する課題**: 個人の思考整理において、マインドマップの作成は手間がかかり、関連キーワードの発想やトピックの深堀りに限界がある。GeniusMap は AI が連想・分析・調査を自動化し、思考の拡張を加速する。
**ターゲットユーザー**: 個人で情報整理・企画立案・学習を行うナレッジワーカー。リサーチャー、ライター、プランナー、学生。従来のマインドマップツール（MindMeister, Miro）を使ったことがあるが、発想の広がりに限界を感じている人。
**PMF 指標**: 週次リテンション 40%以上 / ショーン・エリステスト 40%以上

---

## Tech Stack

- Next.js 15+ (App Router) + TypeScript strict
- Supabase (PostgreSQL + Auth + RLS)
- Tailwind CSS v4 + shadcn/ui
- React Flow (`@xyflow/react`) -- キャンバス描画
- Claude API (`@anthropic-ai/sdk`) -- AI 機能（Server Action 経由）
- Vercel デプロイ
- Zustand (client state) + TanStack Query v5 (server state)
- React Hook Form + Zod
- Vitest (unit) + Playwright (E2E)
- デザイン: @docs/DESIGN_SYSTEM.md のトークン使用
- アーキテクチャ: @docs/ARCHITECTURE.md に従う
- DB設計: @docs/DB_DESIGN.md に従う

### ブランドカラー

```css
:root {
  --color-brand:         #6366f1;
  --color-brand-hover:   #4f46e5;
  --color-brand-subtle:  #eef2ff;
}
.dark {
  --color-brand:         #818cf8;
  --color-brand-hover:   #a5b4fc;
  --color-brand-subtle:  #1e1b4b;
}
```

---

## 画面一覧

| # | 画面名 | パス | 認証 | 説明 |
|---|--------|------|------|------|
| 1 | ランディング | `/` | 不要 | プロダクト紹介。ヒーローセクション + 機能説明 + CTA |
| 2 | ログイン | `/login` | 不要 | Email + Google OAuth ログイン |
| 3 | サインアップ | `/signup` | 不要 | Email サインアップ |
| 4 | ダッシュボード | `/dashboard` | 必須 | マップ一覧の管理 |
| 5 | マップエディタ | `/maps/[mapId]` | 必須 | マインドマップの編集キャンバス + サイドパネル |

---

## 画面仕様（詳細）

### 1. ランディング (`/`)

**表示要素**:
- [ ] ヘッダー: ロゴ（GeniusMap テキストロゴ）+ 「ログイン」ボタン（右端）
- [ ] ヒーローセクション: キャッチコピー「AIが思考を拡張する、次世代マインドマップ」+ サブテキスト「連想・分析・調査をAIが自動化。あなたのアイデアを無限に広げる。」+ 「無料で始める」ボタン（`/signup` へ遷移）
- [ ] 機能紹介セクション: 3カラムで以下を表示
  - AI連想: ノードから関連キーワードを自動生成（Sparkles アイコン）
  - AI分析: 複数ノードの関係を分析・要約（Brain アイコン）
  - AI調査: Web検索で情報を自動収集（Search アイコン）
- [ ] フッター: コピーライト表示「(c) 2026 GeniusMap」

**インタラクション**:
- [ ] 「無料で始める」ボタン クリック → `/signup` に遷移
- [ ] 「ログイン」ボタン クリック → `/login` に遷移
- [ ] 認証済みユーザーがアクセス → `/dashboard` にリダイレクト（middleware）

**データ**: なし（静的ページ）

**状態**: なし（静的ページ）

---

### 2. ログイン (`/login`)

**表示要素**:
- [ ] ページ中央にカード（max-w-sm）
- [ ] カードタイトル: 「ログイン」
- [ ] Google OAuth ボタン: 「Googleでログイン」（フル幅）
- [ ] 区切り線: 「または」
- [ ] Email入力フィールド: placeholder「メールアドレス」
- [ ] パスワード入力フィールド: placeholder「パスワード」
- [ ] ログインボタン: 「ログイン」（フル幅、ブランドカラー）
- [ ] 下部リンク: 「アカウントをお持ちでない方は こちら」→ `/signup`

**インタラクション**:
- [ ] Google OAuth ボタン クリック → Supabase の Google OAuth フロー開始 → 成功: `/dashboard` にリダイレクト / 失敗: toast「ログインに失敗しました」
- [ ] Email/Password ログイン → 成功: `/dashboard` にリダイレクト / 失敗: toast「メールアドレスまたはパスワードが正しくありません」
- [ ] Email 未入力で送信 → インラインエラー「メールアドレスは必須です」
- [ ] パスワード未入力で送信 → インラインエラー「パスワードは必須です」

**データ**: なし

**状態**:
- ローディング: ボタンが disabled + スピナー表示
- エラー: toast でメッセージ表示

---

### 3. サインアップ (`/signup`)

**表示要素**:
- [ ] ページ中央にカード（max-w-sm）
- [ ] カードタイトル: 「アカウント作成」
- [ ] Google OAuth ボタン: 「Googleで登録」（フル幅）
- [ ] 区切り線: 「または」
- [ ] Email入力フィールド: placeholder「メールアドレス」
- [ ] パスワード入力フィールド: placeholder「パスワード（8文字以上）」
- [ ] サインアップボタン: 「アカウントを作成」（フル幅、ブランドカラー）
- [ ] 下部リンク: 「既にアカウントをお持ちの方は こちら」→ `/login`

**インタラクション**:
- [ ] Google OAuth ボタン クリック → Supabase の Google OAuth フロー開始 → 成功: `/dashboard` にリダイレクト / 失敗: toast「登録に失敗しました」
- [ ] Email/Password サインアップ → 成功: 確認メール送信メッセージ表示「確認メールを送信しました。メールのリンクをクリックしてください。」 / 失敗: toast「登録に失敗しました」
- [ ] Email 未入力で送信 → インラインエラー「メールアドレスは必須です」
- [ ] Email 形式不正 → インラインエラー「正しいメールアドレスを入力してください」
- [ ] パスワード8文字未満 → インラインエラー「パスワードは8文字以上で入力してください」

**データ**: なし

**状態**:
- ローディング: ボタンが disabled + スピナー表示
- 送信完了: カード内にメール確認メッセージを表示（フォームは非表示）

---

### 4. ダッシュボード (`/dashboard`)

**表示要素**:
- [ ] ヘッダー: ロゴ（左端、クリックで `/dashboard`）+ ユーザーアバター（右端、クリックでドロップダウン）
- [ ] ユーザードロップダウン: 「ログアウト」のみ
- [ ] ページタイトル: 「マイマップ」（text-2xl font-semibold）
- [ ] 「新規マップ作成」ボタン（ページタイトルの右側、ブランドカラー、Plus アイコン付き）
- [ ] マップ一覧: グリッドレイアウト（モバイル1列、タブレット2列、デスクトップ3列）
- [ ] 各マップカード:
  - タイトル（text-base font-semibold、1行で切り捨て）
  - 説明文（text-sm text-secondary、2行で切り捨て。未設定時は「説明なし」をミュートカラーで表示）
  - ノード数（text-xs text-muted、「12ノード」の形式）
  - 更新日時（text-xs text-muted、相対時間表示「3時間前」「2日前」）
  - 三点メニュー（MoreHorizontal アイコン、右上）: 「複製」「削除」

**インタラクション**:
- [ ] 「新規マップ作成」ボタン クリック → ダイアログ表示。タイトル入力（必須、max 100文字）+ 説明文入力（任意、max 500文字）→ 「作成」ボタン → 成功: 作成されたマップの `/maps/[mapId]` に遷移 / 失敗: toast「マップの作成に失敗しました」
- [ ] マップカード クリック → `/maps/[mapId]` に遷移
- [ ] 三点メニュー →「複製」クリック → 確認なしで即座に複製 → 成功: toast「マップを複製しました」+ 一覧に複製マップが追加される / 失敗: toast「複製に失敗しました」
- [ ] 三点メニュー →「削除」クリック → 確認ダイアログ「このマップを削除しますか？この操作は取り消せません。」→ 「削除」ボタン → 成功: toast「マップを削除しました」+ 一覧から消える / 失敗: toast「削除に失敗しました」
- [ ] ダイアログ内でタイトル未入力 → インラインエラー「タイトルは必須です」

**データ**:
- 取得元: `maps` テーブルの `user_id = auth.uid()` かつ `deleted_at IS NULL` の行
- ノード数: `nodes` テーブルから `map_id` ごとに COUNT
- ソート: `updated_at DESC`
- ページネーション: なし（全件表示。100件上限は将来対応）

**状態**:
- ローディング: カードのスケルトン表示（6枚分のプレースホルダー）
- 空状態: 中央に Map アイコン + 「マップがまだありません」+ 「最初のマップを作成」ボタン（ブランドカラー）
- エラー: toast でメッセージ表示

---

### 5. マップエディタ (`/maps/[mapId]`)

**レイアウト構成**:
```
+------------------------------------------+
| ツールバー                                |
+------------------------------------------+
|                           | サイドパネル   |
|   キャンバス               | (360px 固定幅) |
|   (React Flow)            | (閉じた状態は  |
|                           |  非表示)       |
+------------------------------------------+
```

#### ツールバー

**表示要素**:
- [ ] 左側: 戻るボタン（ArrowLeft アイコン、`/dashboard` に遷移）+ マップタイトル（インライン編集可能、text-lg font-semibold）
- [ ] 中央: なし
- [ ] 右側: 「AI連想」ボタン（Sparkles アイコン + テキスト、ブランドカラー）+ 「AI分析」ボタン（Brain アイコン + テキスト）+ 「AI調査」ボタン（Search アイコン + テキスト）+ AI残り回数バッジ（「残り 42/50」text-xs）

**インタラクション**:
- [ ] マップタイトル クリック → インライン編集モード。Enter または blur で保存。空文字の場合は「無題のマップ」に戻す
- [ ] 「AI連想」ボタン クリック（ノード1つ選択中のみ有効、それ以外は disabled）→ 選択ノードのラベルから関連キーワード5個を生成 → 子ノードとして放射状に配置 + エッジ自動接続 → 成功: キャンバスに反映 / 失敗: toast「AI連想に失敗しました」
- [ ] 「AI分析」ボタン クリック（ノード2つ以上選択中のみ有効、それ以外は disabled）→ サイドパネルが開き、分析結果をストリーミング表示
- [ ] 「AI調査」ボタン クリック（ノード1つ選択中のみ有効、それ以外は disabled）→ サイドパネルが開き、調査結果をストリーミング表示
- [ ] AI残り回数が0 → AI系3ボタン全てが disabled + ツールチップ「本日の利用上限に達しました。明日リセットされます。」

#### キャンバス（React Flow）

**表示要素**:
- [ ] React Flow キャンバス（全画面。ツールバーの下、サイドパネルの左）
- [ ] ノード: 角丸カード（radius-lg）。ラベルテキスト表示。選択中はブランドカラーのボーダー（2px）。非選択時はデフォルトボーダー
- [ ] エッジ: ノード間の接続線。デフォルトの smoothstep タイプ。色は `var(--color-border-strong)`
- [ ] ミニマップ: 右下に表示（React Flow MiniMap コンポーネント）
- [ ] コントロール: 左下にズームイン/ズームアウト/フィット表示ボタン（React Flow Controls コンポーネント）
- [ ] 背景: ドットパターン（React Flow Background コンポーネント、gap: 20, size: 1）

**インタラクション**:
- [ ] キャンバス上でダブルクリック → その位置に新規ノードを作成。ラベルは「新しいノード」。即座にインライン編集モードになる
- [ ] ノード クリック → そのノードを選択状態にする + サイドパネルが開きノード詳細（メモ）を表示
- [ ] ノード ダブルクリック → ラベルのインライン編集モード。Enter で確定、Escape でキャンセル
- [ ] ノードをドラッグ → 位置を移動。ドロップ時にDB保存（デバウンス 500ms）
- [ ] ノードのハンドルからドラッグ → 別ノードにドロップでエッジ（接続線）を作成
- [ ] エッジ選択 + Delete/Backspace キー → エッジを削除
- [ ] ノード選択 + Delete/Backspace キー → 確認ダイアログ「このノードを削除しますか？接続されたエッジも削除されます。」→ 「削除」→ ノードと関連エッジを削除
- [ ] 複数選択: Shift + クリック でノードを複数選択。または矩形選択（ドラッグ）
- [ ] キャンバスをパン（ドラッグ移動）とズーム（スクロール）

#### サイドパネル（右側、360px固定幅）

サイドパネルは3つのモードを持つ: 「ノード詳細」「AI分析結果」「AI調査結果」。閉じたときは非表示（キャンバスがフル幅になる）。

##### モード1: ノード詳細

**表示要素**:
- [ ] パネルヘッダー: ノードのラベル（text-lg font-semibold）+ 閉じるボタン（X アイコン）
- [ ] メモエリア: テキストエリア（プレーンテキスト、placeholder「メモを入力...」、min-h-[200px]）
- [ ] 接続ノード一覧: 「接続先」見出し（text-sm font-medium text-secondary）+ そのノードとエッジで接続されている全ノードのラベルをリスト表示（クリックでそのノードを選択 + キャンバスをパン）

**インタラクション**:
- [ ] メモの編集: テキストエリアに入力 → デバウンス 1000ms で自動保存 → 保存中は「保存中...」テキスト表示、完了で「保存済み」表示（text-xs text-muted、パネルヘッダー右上）
- [ ] 閉じるボタン クリック → サイドパネルを閉じる。ノードの選択状態は解除
- [ ] 接続ノード クリック → そのノードを選択状態にし、キャンバスをそのノードの位置にパン

##### モード2: AI分析結果

**表示要素**:
- [ ] パネルヘッダー: 「AI分析」（text-lg font-semibold）+ 閉じるボタン（X アイコン）
- [ ] 分析対象: 選択されたノードのラベルをバッジで表示
- [ ] 分析結果テキスト: マークダウン形式（見出し、箇条書き、太字対応）。ストリーミング表示
- [ ] 再分析ボタン: 「再分析する」（結果表示後に表示、パネル下部）

**インタラクション**:
- [ ] パネル表示時に自動で分析APIを呼び出し、ストリーミングで結果を表示
- [ ] 「再分析する」ボタン → 前回の結果をクリアして再度APIを呼び出す
- [ ] 閉じるボタン → サイドパネルを閉じる

##### モード3: AI調査結果

**表示要素**:
- [ ] パネルヘッダー: 「AI調査」（text-lg font-semibold）+ 閉じるボタン（X アイコン）
- [ ] 調査対象: 選択されたノードのラベルをバッジで表示
- [ ] 調査結果テキスト: マークダウン形式。ストリーミング表示
- [ ] 「ノードとして追加」ボタン: 調査結果の各セクション見出し（h2, h3）の横に「+ ノード追加」ボタンを表示。クリックでその見出しテキストをラベルとする新規ノードを作成し、調査対象ノードとエッジで接続
- [ ] 再調査ボタン: 「再調査する」（結果表示後に表示、パネル下部）

**インタラクション**:
- [ ] パネル表示時に自動で調査APIを呼び出し、ストリーミングで結果を表示
- [ ] 「+ ノード追加」ボタン クリック → 見出しテキストをラベルとする新規ノードを調査対象ノードの右側に生成 + エッジ自動接続 → toast「ノードを追加しました」
- [ ] 「再調査する」ボタン → 前回の結果をクリアして再度APIを呼び出す
- [ ] 閉じるボタン → サイドパネルを閉じる

**全モード共通の状態**:
- ローディング（AI結果）: パネル内にスピナー + 「分析中...」/「調査中...」テキスト → ストリーミング開始後はテキストが段階的に表示
- AI エラー: パネル内に「エラーが発生しました」+ 「再試行」ボタン
- AI回数上限超過: パネル内に「本日の利用上限（50回）に達しました。明日リセットされます。」メッセージ表示

#### マップエディタの全体状態

- ローディング: キャンバス全体にスケルトン表示（中央にスピナー + 「読み込み中...」）
- マップが存在しない（404）: 「マップが見つかりません」+ 「ダッシュボードに戻る」ボタン
- エラー: toast でメッセージ表示

---

## データベース設計

### updated_at 自動更新トリガー（共通関数）

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
```

### user_profiles テーブル

```sql
CREATE TABLE user_profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles select own row"
ON user_profiles FOR SELECT TO authenticated
USING ((select auth.uid()) = id);

CREATE POLICY "user_profiles insert own row"
ON user_profiles FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "user_profiles update own row"
ON user_profiles FOR UPDATE TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### maps テーブル

```sql
CREATE TABLE maps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT '無題のマップ',
  description text NOT NULL DEFAULT '',
  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "maps select own rows"
ON maps FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "maps insert own rows"
ON maps FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "maps update own rows"
ON maps FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id AND deleted_at IS NULL)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "maps delete own rows"
ON maps FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

CREATE INDEX idx_maps_user_id ON maps(user_id);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON maps
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### nodes テーブル

```sql
CREATE TABLE nodes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id      uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  label       text NOT NULL DEFAULT '新しいノード',
  memo        text NOT NULL DEFAULT '',
  position_x  double precision NOT NULL DEFAULT 0,
  position_y  double precision NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nodes select via map ownership"
ON nodes FOR SELECT TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "nodes insert via map ownership"
ON nodes FOR INSERT TO authenticated
WITH CHECK (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "nodes update via map ownership"
ON nodes FOR UPDATE TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
)
WITH CHECK (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "nodes delete via map ownership"
ON nodes FOR DELETE TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE INDEX idx_nodes_map_id ON nodes(map_id);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON nodes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### edges テーブル

```sql
CREATE TABLE edges (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id          uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  source_node_id  uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id  uuid NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT edges_no_self_loop CHECK (source_node_id != target_node_id),
  CONSTRAINT edges_unique_pair UNIQUE (map_id, source_node_id, target_node_id)
);

ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edges select via map ownership"
ON edges FOR SELECT TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "edges insert via map ownership"
ON edges FOR INSERT TO authenticated
WITH CHECK (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "edges update via map ownership"
ON edges FOR UPDATE TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
)
WITH CHECK (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE POLICY "edges delete via map ownership"
ON edges FOR DELETE TO authenticated
USING (
  map_id IN (
    SELECT id FROM maps
    WHERE (select auth.uid()) = user_id AND deleted_at IS NULL
  )
);

CREATE INDEX idx_edges_map_id ON edges(map_id);
CREATE INDEX idx_edges_source_node_id ON edges(source_node_id);
CREATE INDEX idx_edges_target_node_id ON edges(target_node_id);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON edges
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### ai_usage_logs テーブル

AI利用回数を追跡するテーブル。1日50回の上限管理に使用する。

```sql
CREATE TABLE ai_usage_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('associate', 'analyze', 'research')),
  map_id      uuid NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_logs select own rows"
ON ai_usage_logs FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "ai_usage_logs insert own rows"
ON ai_usage_logs FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX idx_ai_usage_logs_user_id_created_at ON ai_usage_logs(user_id, created_at);
```

### RLS ヘルパー関数

```sql
CREATE OR REPLACE FUNCTION get_map_owner(p_map_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT user_id FROM maps WHERE id = p_map_id AND deleted_at IS NULL;
$$;
```

---

## Server Actions

### maps feature

| Action | ファイル | 入力(Zod) | 出力 | 説明 |
|--------|----------|-----------|------|------|
| createMap | `features/maps/actions/createMap.ts` | `{ title: z.string().min(1).max(100), description: z.string().max(500).default('') }` | `Result<{ id: string }>` | マップを新規作成 |
| updateMap | `features/maps/actions/updateMap.ts` | `{ id: z.string().uuid(), title: z.string().min(1).max(100).optional(), description: z.string().max(500).optional() }` | `Result<void>` | マップのタイトル/説明を更新 |
| deleteMap | `features/maps/actions/deleteMap.ts` | `{ id: z.string().uuid() }` | `Result<void>` | マップをソフトデリート（deleted_at を設定） |
| duplicateMap | `features/maps/actions/duplicateMap.ts` | `{ id: z.string().uuid() }` | `Result<{ id: string }>` | マップを複製（全ノードとエッジも複製。タイトルは「{元タイトル}のコピー」） |

### nodes feature

| Action | ファイル | 入力(Zod) | 出力 | 説明 |
|--------|----------|-----------|------|------|
| createNode | `features/nodes/actions/createNode.ts` | `{ mapId: z.string().uuid(), label: z.string().min(1).max(200).default('新しいノード'), positionX: z.number(), positionY: z.number() }` | `Result<{ id: string }>` | ノードを新規作成 |
| updateNode | `features/nodes/actions/updateNode.ts` | `{ id: z.string().uuid(), label: z.string().min(1).max(200).optional(), memo: z.string().max(5000).optional(), positionX: z.number().optional(), positionY: z.number().optional() }` | `Result<void>` | ノードの各フィールドを更新 |
| deleteNode | `features/nodes/actions/deleteNode.ts` | `{ id: z.string().uuid() }` | `Result<void>` | ノードを削除（関連エッジは CASCADE で自動削除） |
| bulkUpdateNodePositions | `features/nodes/actions/bulkUpdateNodePositions.ts` | `{ nodes: z.array(z.object({ id: z.string().uuid(), positionX: z.number(), positionY: z.number() })) }` | `Result<void>` | 複数ノードの位置を一括更新（ドラッグ&ドロップ後のバッチ保存） |

### edges feature

| Action | ファイル | 入力(Zod) | 出力 | 説明 |
|--------|----------|-----------|------|------|
| createEdge | `features/edges/actions/createEdge.ts` | `{ mapId: z.string().uuid(), sourceNodeId: z.string().uuid(), targetNodeId: z.string().uuid() }` | `Result<{ id: string }>` | エッジを新規作成 |
| deleteEdge | `features/edges/actions/deleteEdge.ts` | `{ id: z.string().uuid() }` | `Result<void>` | エッジを削除 |

### ai feature

| Action | ファイル | 入力(Zod) | 出力 | 説明 |
|--------|----------|-----------|------|------|
| aiAssociate | `features/ai/actions/aiAssociate.ts` | `{ mapId: z.string().uuid(), nodeId: z.string().uuid() }` | `Result<{ keywords: z.array(z.string()).length(5) }>` | 選択ノードのラベルから関連キーワード5個を生成。利用回数を記録。回数上限チェックあり |
| aiAnalyze | `features/ai/actions/aiAnalyze.ts` | `{ mapId: z.string().uuid(), nodeIds: z.array(z.string().uuid()).min(2) }` | ストリーミングレスポンス（ReadableStream） | 複数ノードのラベルとメモを入力として分析結果をストリーミング返却。利用回数を記録。回数上限チェックあり |
| aiResearch | `features/ai/actions/aiResearch.ts` | `{ mapId: z.string().uuid(), nodeId: z.string().uuid() }` | ストリーミングレスポンス（ReadableStream） | ノードのラベルを入力としてWeb検索 + 調査結果をストリーミング返却。利用回数を記録。回数上限チェックあり |
| getAiUsageCount | `features/ai/queries/getAiUsageCount.ts` | なし | `{ count: number, limit: number }` | 本日のAI利用回数と上限を返す |

### AI Action 共通仕様

- 利用回数チェック: `ai_usage_logs` テーブルから当日（UTC 0:00 リセット）のレコード数をカウント。50以上なら `err(new Error('AI利用回数の上限に達しました'))` を返す
- 利用回数記録: APIコール成功後に `ai_usage_logs` にレコードを INSERT
- aiAssociate のプロンプト: 「以下のキーワードに関連するキーワードを5つ、JSON配列形式で返してください。各キーワードは簡潔（10文字以内）にしてください。キーワード: {ノードラベル}」
- aiAnalyze のプロンプト: 「以下のキーワードとメモの関係性を分析し、共通テーマ、相違点、新しい視点を日本語のマークダウン形式で記述してください。\n\nキーワード:\n{各ノードのラベル+メモのリスト}」
- aiResearch のプロンプト: 「以下のトピックについて調査し、概要、主要なポイント、関連トピックをマークダウン形式で日本語で記述してください。各セクションには明確な見出し（## または ###）を付けてください。\n\nトピック: {ノードラベル}」
- aiAnalyze, aiResearch はストリーミングレスポンスのため Route Handler (`/api/ai/analyze`, `/api/ai/research`) で実装する。Server Action ではストリーミングが困難なため例外的に Route Handler を使用する
- aiAssociate は JSON レスポンスで十分なため Server Action で実装する

---

## Queries

| Query | ファイル | 出力 | 説明 |
|-------|----------|------|------|
| getMaps | `features/maps/queries/getMaps.ts` | `Map[]` | ユーザーの全マップ一覧（ノード数含む） |
| getMapById | `features/maps/queries/getMapById.ts` | `Map \| null` | 特定マップの詳細 |
| getMapWithNodesAndEdges | `features/maps/queries/getMapWithNodesAndEdges.ts` | `{ map: Map, nodes: Node[], edges: Edge[] }` | マップエディタ用。マップ + 全ノード + 全エッジを一括取得 |
| getAiUsageCount | `features/ai/queries/getAiUsageCount.ts` | `{ count: number, limit: number }` | 本日のAI利用回数と上限 |

---

## 認証フロー

- Supabase Auth (Email + Google OAuth)
- 未ログインユーザーが `/dashboard` または `/maps/*` にアクセス → `/login` にリダイレクト（middleware.ts で制御）
- ログイン済みユーザーが `/login` または `/signup` にアクセス → `/dashboard` にリダイレクト（middleware.ts で制御）
- ログイン成功 → `/dashboard` にリダイレクト
- サインアップ成功（Email） → 確認メール送信。メール内リンクをクリック後に `/dashboard` にリダイレクト（`/auth/callback` Route Handler で処理）
- サインアップ成功（Google OAuth） → 即座に `/dashboard` にリダイレクト
- セッション切れ → `/login` にリダイレクト + toast「セッションが切れました。再度ログインしてください。」
- ログアウト → Supabase Auth signOut → `/` にリダイレクト
- 新規ユーザー登録時に `user_profiles` テーブルにレコードを自動作成（Supabase Auth トリガー or 初回ログイン時にアプリ側で作成）

### Middleware ルーティング

```
保護対象パス: /dashboard, /maps/*
公開パス: /, /login, /signup, /auth/callback
```

---

## エラーハンドリング

- フォームバリデーションエラー: インライン表示（入力欄の下に `text-sm text-[var(--color-danger)]` で赤文字）
- Server Action エラー: `sonner` の toast でメッセージ表示（error variant）
- Server Action 成功: `sonner` の toast で成功メッセージ（success variant）
- 404（マップが存在しない場合）: マップエディタ画面内に「マップが見つかりません」+ 「ダッシュボードに戻る」ボタン
- 404（ルートが存在しない場合）: `app/not-found.tsx` -- 「ページが見つかりません」+ 「トップに戻る」ボタン
- 500: `app/error.tsx` -- 「エラーが発生しました」+ 「再読み込み」ボタン
- AI API エラー: サイドパネル内に「エラーが発生しました」+ 「再試行」ボタン
- AI回数上限超過: サイドパネル内に「本日の利用上限（50回）に達しました。明日リセットされます。」
- ネットワークエラー: toast「通信エラーが発生しました。接続を確認してください。」

---

## 実装優先順位

### Phase 1（MVP必須）
- [ ] 認証（ログイン/サインアップ/ログアウト/ミドルウェア）
- [ ] ダッシュボード（マップ一覧 + 新規作成 + 削除 + 複製）
- [ ] マップエディタ（キャンバス + ノード CRUD + エッジ CRUD + サイドパネル: ノード詳細）
- [ ] AI連想機能（選択ノードから関連キーワード5個生成）
- [ ] AI分析機能（複数ノードの分析結果をサイドパネルに表示）
- [ ] AI調査機能（ノードの調査結果をサイドパネルに表示 + ノード追加）
- [ ] AI利用回数制限（1日50回）
- [ ] ランディングページ

### Phase 2（重要、MVP後）
- [ ] エクスポート機能（PNG, JSON）
- [ ] マップのソート・検索（ダッシュボード）
- [ ] ノードの色分け・ラベル
- [ ] Undo/Redo

### Phase 3（あると良い）
- [ ] リアルタイム共同編集
- [ ] テンプレートマップ
- [ ] AI連想のカスタマイズ（キーワード数変更、言語指定）
- [ ] 課金・プラン管理

---

## 実装しないこと（スコープ外）

- [ ] チーム/組織機能（個人利用のみ）
- [ ] 課金/サブスクリプション（MVP では無料）
- [ ] エクスポート機能（Phase 2 以降）
- [ ] リアルタイム共同編集
- [ ] ノードの色分け・ラベル
- [ ] Undo/Redo
- [ ] マップの共有リンク（公開URL）
- [ ] モバイルアプリ
- [ ] オフラインサポート
- [ ] マップのフォルダ/タグ整理

---

## 自律実装計画

### Phase A: 基盤（推定時間: 2時間）

- [ ] プロジェクトセットアップ（Next.js 15 + TypeScript strict + Tailwind CSS v4 + shadcn/ui）
- [ ] Supabase プロジェクト接続設定（`lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`）
- [ ] `lib/types/result.ts` に Result パターン定義
- [ ] ブランドカラートークン設定（`#6366f1` のインディゴ系）
- [ ] 共通レイアウト（ヘッダー、ページヘッダーコンポーネント）
- [ ] Auth 機能（ログイン/サインアップ/ログアウト/ミドルウェア/コールバック）
- [ ] DB マイグレーション（user_profiles, maps, nodes, edges, ai_usage_logs テーブル + RLS + インデックス + トリガー）
- [ ] ランディングページ
- 検証: `npm run build` 成功 + `npm run typecheck` 成功 + 認証フローが動作

### Phase B: コア機能（推定時間: 4時間）

- [ ] ダッシュボード画面（マップ一覧 + 新規作成ダイアログ + 削除 + 複製）
- [ ] マップエディタ: React Flow キャンバスセットアップ（Background, MiniMap, Controls）
- [ ] マップエディタ: ノード CRUD（作成、ラベル編集、位置移動、削除）
- [ ] マップエディタ: エッジ CRUD（接続作成、削除）
- [ ] マップエディタ: サイドパネル -- ノード詳細モード（メモ編集 + 接続ノード一覧）
- [ ] マップエディタ: ツールバー（タイトルインライン編集 + 戻るボタン）
- [ ] AI連想機能（Server Action + ノード自動生成）
- [ ] AI分析機能（Route Handler + ストリーミング + サイドパネル表示）
- [ ] AI調査機能（Route Handler + ストリーミング + サイドパネル表示 + ノード追加）
- [ ] AI利用回数制限（カウント取得 + 上限チェック + バッジ表示）
- 検証: `npm run typecheck` 成功 + `npm run lint` 成功 + 全 Server Action が正しく Result を返す + キャンバス上でノード/エッジの CRUD が動作

### Phase C: 統合・品質（推定時間: 2時間）

- [ ] 全画面結合テスト（ダッシュボード → マップ作成 → エディタ → ノード操作 → AI機能）
- [ ] RLS 検証（他ユーザーのマップ/ノード/エッジにアクセスできないことを確認）
- [ ] レスポンシブ対応（モバイル: サイドパネルはオーバーレイ表示、ツールバーはアイコンのみ）
- [ ] ダークモード対応（全画面でブランドカラー含むトークンが正しく切り替わること）
- [ ] ローディング/空状態/エラー状態が全画面に実装されていること
- [ ] エラーページ（404, 500）
- [ ] Vitest ユニットテスト（Server Actions のバリデーション + Result パターン）
- [ ] Playwright E2E テスト（認証フロー + マップ CRUD + ノード操作）
- 検証: `npm run typecheck && npm run lint` パス + `npm run test` パス + `npm run test:e2e` パス + QA Agent 実行で全チェック通過

### エラー時

- ビルドエラー → エラーメッセージを読んで修正。同じ修正パターンが3回失敗したら別アプローチをリストアップして最も有望な代替を試す
- テスト失敗 → テストではなくコードを修正する
- React Flow の型エラー → `@xyflow/react` の型定義を確認し、カスタムノード型を正しく定義する
- ストリーミングレスポンスエラー → Route Handler のレスポンス形式（ReadableStream + TextEncoder）を確認する
- 仕様不明 → この SPEC.md の記述に従う。記述がない場合は一般的パターンを採用し TODO コメントを付ける

---

## Feature フォルダ構成

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # ランディング
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── auth/callback/route.ts      # OAuth コールバック
│   ├── dashboard/page.tsx
│   ├── maps/[mapId]/page.tsx
│   └── api/
│       └── ai/
│           ├── analyze/route.ts    # AI分析ストリーミング
│           └── research/route.ts   # AI調査ストリーミング
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── OAuthButton.tsx
│   │   └── actions/
│   │       ├── login.ts
│   │       ├── signup.ts
│   │       └── logout.ts
│   ├── maps/
│   │   ├── components/
│   │   │   ├── MapCard.tsx
│   │   │   ├── MapList.tsx
│   │   │   ├── CreateMapDialog.tsx
│   │   │   └── DeleteMapDialog.tsx
│   │   ├── actions/
│   │   │   ├── createMap.ts
│   │   │   ├── updateMap.ts
│   │   │   ├── deleteMap.ts
│   │   │   └── duplicateMap.ts
│   │   ├── queries/
│   │   │   ├── getMaps.ts
│   │   │   ├── getMapById.ts
│   │   │   └── getMapWithNodesAndEdges.ts
│   │   └── types.ts
│   ├── editor/
│   │   ├── components/
│   │   │   ├── MapCanvas.tsx           # React Flow メインキャンバス
│   │   │   ├── MapToolbar.tsx          # ツールバー
│   │   │   ├── CustomNode.tsx          # カスタムノードコンポーネント
│   │   │   ├── SidePanel.tsx           # サイドパネルコンテナ
│   │   │   ├── NodeDetailPanel.tsx     # ノード詳細モード
│   │   │   ├── AiAnalyzePanel.tsx      # AI分析結果モード
│   │   │   ├── AiResearchPanel.tsx     # AI調査結果モード
│   │   │   └── InlineEditableTitle.tsx # インライン編集タイトル
│   │   ├── hooks/
│   │   │   ├── useMapEditor.ts         # キャンバスの状態管理（nodes, edges, onNodesChange, onEdgesChange）
│   │   │   ├── useSidePanel.ts         # サイドパネルの開閉・モード管理
│   │   │   └── useAutoSave.ts          # デバウンスでの自動保存
│   │   └── types.ts
│   ├── nodes/
│   │   ├── actions/
│   │   │   ├── createNode.ts
│   │   │   ├── updateNode.ts
│   │   │   ├── deleteNode.ts
│   │   │   └── bulkUpdateNodePositions.ts
│   │   └── types.ts
│   ├── edges/
│   │   ├── actions/
│   │   │   ├── createEdge.ts
│   │   │   └── deleteEdge.ts
│   │   └── types.ts
│   └── ai/
│       ├── actions/
│       │   └── aiAssociate.ts
│       ├── queries/
│       │   └── getAiUsageCount.ts
│       ├── hooks/
│       │   └── useAiStream.ts          # ストリーミングレスポンスを購読するフック
│       └── types.ts
├── components/
│   ├── ui/                             # shadcn/ui primitives
│   └── layout/
│       ├── Header.tsx
│       ├── PageHeader.tsx
│       └── UserMenu.tsx
└── lib/
    ├── supabase/
    │   ├── client.ts
    │   ├── server.ts
    │   └── middleware.ts
    ├── types/
    │   └── result.ts
    └── ai/
        └── client.ts                   # Anthropic SDK クライアント初期化
```

---

## QA チェックリスト

`qa` エージェントが以下を検証する:

### ページ表示
- [ ] `/` が正常に表示される
- [ ] `/login` が正常に表示される
- [ ] `/signup` が正常に表示される
- [ ] `/dashboard` が認証後に正常に表示される
- [ ] `/maps/[mapId]` が認証後に正常に表示される
- [ ] 存在しない URL で 404 ページが表示される
- [ ] 存在しない mapId で「マップが見つかりません」が表示される

### 認証
- [ ] Email でサインアップできる
- [ ] Email でログインできる
- [ ] Google OAuth でログインできる
- [ ] ログアウトできる
- [ ] 未ログインで `/dashboard` にアクセスすると `/login` にリダイレクトされる
- [ ] ログイン済みで `/login` にアクセスすると `/dashboard` にリダイレクトされる

### ダッシュボード
- [ ] マップ一覧が表示される
- [ ] 新規マップを作成できる（タイトル入力 → 作成 → エディタに遷移）
- [ ] マップカードクリックでエディタに遷移する
- [ ] マップを削除できる（確認ダイアログ → 一覧から消える）
- [ ] マップを複製できる（一覧に「{タイトル}のコピー」が追加される）
- [ ] マップが0件のとき空状態が表示される
- [ ] ローディング中にスケルトンが表示される

### マップエディタ: キャンバス
- [ ] React Flow キャンバスが表示される（Background, MiniMap, Controls）
- [ ] キャンバスダブルクリックで新規ノードが作成される
- [ ] ノードをドラッグで移動できる
- [ ] ノードのラベルをダブルクリックで編集できる
- [ ] ノードのハンドルからドラッグでエッジを作成できる
- [ ] ノードを選択して Delete キーで削除できる（確認ダイアログ付き）
- [ ] エッジを選択して Delete キーで削除できる
- [ ] Shift+クリックで複数ノードを選択できる
- [ ] パン（ドラッグ移動）とズーム（スクロール）が動作する

### マップエディタ: サイドパネル
- [ ] ノードクリックでサイドパネルが開きノード詳細が表示される
- [ ] メモを編集すると自動保存される
- [ ] 接続ノード一覧が表示され、クリックでそのノードに移動する
- [ ] 閉じるボタンでサイドパネルが閉じる

### マップエディタ: ツールバー
- [ ] 戻るボタンでダッシュボードに遷移する
- [ ] マップタイトルをインライン編集して保存できる

### AI機能
- [ ] ノード1つ選択時に「AI連想」ボタンが有効になる
- [ ] AI連想で5つの子ノードが生成されエッジで接続される
- [ ] ノード2つ以上選択時に「AI分析」ボタンが有効になる
- [ ] AI分析でサイドパネルに分析結果がストリーミング表示される
- [ ] ノード1つ選択時に「AI調査」ボタンが有効になる
- [ ] AI調査でサイドパネルに調査結果がストリーミング表示される
- [ ] AI調査結果の見出し横「+ ノード追加」でノードが生成される
- [ ] AI利用回数バッジが正しく表示される
- [ ] AI利用回数が50に達するとAIボタンが全て disabled になる

### レスポンシブ・テーマ
- [ ] モバイル表示が崩れていない
- [ ] ダークモードが崩れていない（全画面でブランドカラー含む全トークン）

### 品質
- [ ] ローディング状態が全画面にある
- [ ] 空状態が該当画面にある
- [ ] エラー状態（toast）が操作失敗時に表示される
- [ ] TypeScript エラー 0件（`npm run typecheck`）
- [ ] ESLint エラー 0件（`npm run lint`）
