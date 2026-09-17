# Synapse

Synapse 是給 AI 讀書會使用的協作式學習地圖。它把主題、先備知識與延伸關聯呈現在同一張視覺化地圖上，讓成員能快速理解學習順序、瀏覽筆記與資源，也讓管理者持續整理課程內容。

## 功能

- 視覺化 AI Learning Map
- 主題列表、分類與狀態篩選
- 主題詳情、先備知識、相關主題與學習資源
- 管理者登入
- 新增與編輯主題及其關聯
- Supabase PostgreSQL 資料儲存

## 技術

- Next.js 16（App Router）
- React 19、TypeScript
- Supabase
- React Flow
- Tailwind CSS 4
- Vitest、Testing Library

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 建立 Supabase 資料庫

建立一個 Supabase project，接著在 Supabase SQL Editor 依序執行：

1. `supabase/migrations/001_topics.sql`
2. `supabase/seed.sql`

Seed 會加入一組 AI 學習主題、關聯與範例資源，而且可以安全地重複執行。

### 3. 設定環境變數

在專案根目錄建立 `.env.local`：

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-strong-password
```

`SUPABASE_SERVICE_ROLE_KEY` 具有高權限，只能放在伺服器端環境變數中，不要提交到 Git 或暴露給瀏覽器。

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。管理頁面位於 [http://localhost:3000/admin/topics](http://localhost:3000/admin/topics)，登入密碼為 `ADMIN_PASSWORD`。

## 常用指令

```bash
npm run dev        # 啟動開發伺服器
npm run build      # 建立 production build
npm run start      # 啟動 production server
npm run lint       # 執行 ESLint
npm run typecheck  # 執行 TypeScript 檢查
npm test           # 執行測試
```

## 主要路由

- `/`：Learning Map
- `/topics`：主題列表
- `/topics/[slug]`：主題詳情
- `/admin/login`：管理者登入
- `/admin/topics`：主題管理
- `/admin/topics/new`：新增主題

## 專案結構

```text
src/
├── app/                    # 頁面與 layouts
├── components/             # 共用 UI
├── features/
│   ├── admin/              # 管理者登入
│   ├── learning-map/       # 地圖呈現與佈局
│   └── topics/             # 主題資料、表單與詳情
└── lib/                    # Supabase、session 與共用工具
supabase/
├── migrations/             # 資料庫 schema
└── seed.sql                # 開發用範例資料
```

更完整的產品背景與 V1 範圍請參考 [AI Study Group Web App — V1 Product Spec.md](AI%20Study%20Group%20Web%20App%20—%20V1%20Product%20Spec.md)。
