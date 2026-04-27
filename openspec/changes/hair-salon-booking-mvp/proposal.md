## Why

美髮店目前缺乏線上預約機制，客戶只能透過電話預約，店家需要手動管理時段，容易發生重複預約或遺漏。此 MVP 提供 LINE 與網頁雙管道預約，讓客戶自助完成預約，店家透過後台管理時段與公休日。

## What Changes

- 新增網頁預約介面（選擇服務項目 → 自動計算可用時段 → 確認預約）
- 新增 LINE LIFF 預約入口（嵌入 LINE 官方帳號 Rich Menu）
- 新增店家後台管理介面（服務項目管理、公休日設定、預約查詢）
- 預約成功後自動發送 LINE 通知給客戶與店家
- **部署後修正**：Prisma 改用 `POSTGRES_PRISMA_URL`（連線池）+ `POSTGRES_URL_NON_POOLING`（直連）解決 Neon 連線問題
- **可用時段改善**：當日已過時段自動 disable，避免客戶選到無效時間
- **LINE 通知時區修正**：push message 日期時間明確指定 `Asia/Taipei` 時區
- **LIFF 顯示名稱自動填入**：預約表單自動帶入 LINE 顯示名稱
- **UI/UX 改善**：步驟條連接線、服務選單改用 Button、空狀態設計、確認頁加入行事曆功能、送出失敗錯誤提示
- **後台 UI 全面改版**：新增 Admin 共用 layout（header + 導覽列），各管理頁面改用 shadcn Field/FieldLabel、DatePicker（Calendar + Popover）、Switch、InputGroup 元件
- **服務刪除功能**：新增 `DELETE /api/admin/services/[id]`（有預約紀錄則拒絕）與啟用 API `PATCH /api/admin/services/[id]/activate`
- **修正 LIFF 底部多餘空間**：移除 `/booking` 頁面容器的 `min-h-dvh`，消除可滾動空白區域
- **設定頁面閃爍修正**：初始 state 設為 `null`，資料載入後才渲染表單避免閃爍
- **主色調更新為藍色系**
- **RSC + Server Actions 全面重構**：所有頁面改為 RSC 直接查詢 Prisma，互動邏輯抽出為 `*-client.tsx`，資料變更透過 Server Actions + `revalidatePath` 處理，移除 `src/lib/fetch.ts`
- **API Routes 清理**：除 `webhook/line` 外，所有內部 API Routes 已由 Server Actions 取代，統一刪除 15 條路由
- **Next.js 16+ 最佳實踐**：`middleware.ts` 改名為 `proxy.ts`（`proxy()` / `proxyConfig`）；新增 `global-error.tsx`、`not-found.tsx`；`error.tsx` 補上 `error` 參數；LINE 通知改用 `after()` 確保 serverless 環境執行完成
- **效能改善**：`next.config.ts` 加入 `optimizePackageImports: ['lucide-react']`，消除 barrel import cold start 開銷
- **Admin Server Actions 安全驗證**：新增 `src/lib/admin-auth.ts` `verifyAdmin()` helper，所有 admin Server Actions 內部驗證 Basic Auth，防止繞過 proxy 直接呼叫
- **時區處理統一**：全面改用 `toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' })` 取代 `setHours`/`toDateString`，消除時區誤差
- **新增 favicon**：`src/app/favicon.ico`

## Non-Goals (optional)

- 不支援多設計師（MVP 僅限單一設計師）
- 不支援線上付款
- 不支援多商家（非 SaaS 架構）
- 不支援候補名單

## Capabilities

### New Capabilities

- `service-catalog`: 服務項目管理，包含名稱、時長、描述
- `availability`: 可用時段計算引擎，依服務時長、公休日、既有預約計算可預約時間點
- `booking`: 預約建立、查詢、取消核心流程
- `holiday-management`: 公休日與特殊休息日期設定
- `line-integration`: LINE Messaging API 整合，包含 LIFF 應用程式與預約成功通知
- `admin-panel`: 店家後台管理介面（服務設定、公休日、預約管理）

### Modified Capabilities

（無）

## Impact

- Affected specs: `service-catalog`, `availability`, `booking`, `holiday-management`, `line-integration`, `admin-panel`
- Affected code:
  - `src/app/` — Next.js 頁面（預約流程、後台管理）
  - `src/app/admin/layout.tsx` — Admin 共用 layout（header + AdminNav）
  - `src/app/admin/_components/admin-nav.tsx` — 後台導覽元件
  - `src/app/api/webhook/line/route.ts` — 保留唯一 API Route（LINE 外部 webhook）
  - `src/app/booking/actions.ts` — 預約 Server Actions（getAvailability、createBooking）
  - `src/app/admin/actions.ts` — Admin Server Actions（cancelBooking）
  - `src/app/admin/holidays/actions.ts` — 公休日 Server Actions
  - `src/app/admin/services/actions.ts` — 服務 Server Actions
  - `src/app/admin/settings/actions.ts` — 設定 Server Actions
  - `src/app/admin/_components/admin-bookings-client.tsx` — 預約管理 Client Component
  - `src/app/admin/holidays/_components/holidays-client.tsx` — 公休日管理 Client Component
  - `src/app/admin/services/_components/services-client.tsx` — 服務管理 Client Component
  - `src/app/admin/settings/_components/settings-client.tsx` — 設定 Client Component
  - `src/app/global-error.tsx` — Root layout 錯誤邊界
  - `src/app/not-found.tsx` — 自訂 404 頁面
  - `src/proxy.ts` — Next.js 16+ proxy（原 middleware.ts）
  - `src/lib/admin-auth.ts` — Admin Basic Auth 驗證 helper
  - `src/components/date-picker.tsx` — 可複用 DatePicker 元件
  - `src/lib/` — 業務邏輯（時段計算、LINE 通知）
  - `prisma/schema.prisma` — 資料庫結構
  - `src/app/globals.css` — 主色調更新為藍色系
  - `src/app/liff/` — LINE LIFF 入口頁
  - `src/app/favicon.ico` — 網站 favicon
  - `next.config.ts` — optimizePackageImports 設定
- Dependencies: Next.js 16+, PostgreSQL (Prisma ORM), LINE Messaging API SDK, LIFF SDK, Vercel
