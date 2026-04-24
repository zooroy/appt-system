## 1. 專案初始化與資料庫結構設計

- [x] 1.1 初始化 Next.js 專案（App Router）並安裝依賴：Prisma、@line/bot-sdk、@line/liff
- [x] 1.2 初始化 UI 元件庫選型：執行 `pnpm dlx shadcn@latest init --preset b3SReJoXo --template next` 設定 Tailwind CSS + shadcn/ui
- [x] 1.3 設定 Vercel Postgres 連線，建立 `DATABASE_URL` 環境變數
- [x] 1.4 建立 Prisma schema：資料庫結構設計（Service、Booking、Holiday、Settings 資料表）
- [x] 1.5 撰寫並執行初始 migration，建立所有資料表
- [x] 1.6 建立 seed 腳本，預設填入基本營業時間設定（09:00–18:00，間隔 30 分鐘）

## 2. 服務項目管理（service-catalog）

- [x] 2.1 建立 `GET /api/services` API：回傳所有啟用中的服務清單（Admin can view available services）
- [x] 2.2 建立 `POST /api/admin/services` API：新增服務項目，驗證名稱與時長必填（Admin can manage service items）
- [x] 2.3 建立 `PATCH /api/admin/services/[id]` API：更新服務項目名稱、時長、描述（Admin can manage service items）
- [x] 2.4 建立 `PATCH /api/admin/services/[id]/deactivate` API：停用服務（非刪除），不允許刪除有預約紀錄的服務（Admin can manage service items）

## 3. 公休日管理（holiday-management）

- [x] 3.1 建立 `GET /api/admin/holidays` API：回傳所有已設定的公休日清單
- [x] 3.2 建立 `POST /api/admin/holidays` API：新增公休日（日期 + 原因），拒絕重複日期（Admin can define holiday dates）
- [x] 3.3 建立 `DELETE /api/admin/holidays/[id]` API：移除指定公休日（Admin can define holiday dates）
- [x] 3.4 建立 `GET /api/holidays` API：提供前端日曆標記公休日使用（System blocks booking on holiday dates）

## 4. 可用時段計算引擎（availability）

- [x] 4.1 實作可用時段計算策略：`calculateAvailableSlots(date, serviceDurationMinutes)` 函式於 `src/lib/availability.ts`，以 30 分鐘為單位滑動視窗掃描營業時間，排除 Holiday 日期與既有 CONFIRMED 預約（System calculates available time slots based on service duration）
- [x] 4.2 建立 `GET /api/availability?date=YYYY-MM-DD&serviceId=xxx` API：呼叫計算引擎並回傳可用開始時間陣列（System calculates available time slots based on service duration）
- [x] 4.3 撰寫 availability 計算的單元測試，涵蓋：正常日、公休日、全滿場景、服務跨越下班時間的截斷（System prevents double-booking via transactional lock）

## 5. 預約核心流程（booking）

- [x] 5.1 建立 `POST /api/bookings` API：使用 Prisma transaction + `SELECT FOR UPDATE` 鎖定時段，驗證無衝突後建立預約（System prevents double-booking via transactional lock）
- [x] 5.2 在 `POST /api/bookings` 中驗證必填欄位（customerName、customerPhone、serviceId、startTime），回傳結構化錯誤（Customer can create a booking）
- [x] 5.3 建立 `POST /api/bookings/[id]/cancel` API：允許客戶取消預約，強制執行 2 小時前取消限制（Customer can cancel a booking）
- [x] 5.4 建立 `PATCH /api/admin/bookings/[id]/cancel` API：允許管理員取消任意預約，不受時間限制（Admin can view and manage all bookings）
- [x] 5.5 建立 `GET /api/admin/bookings` API：支援 date 與 status 過濾參數，回傳預約清單（Admin can view and manage all bookings）

## 6. LINE 整合架構（line-integration）

- [x] 6.1 建立 LINE Messaging API Webhook 端點 `POST /api/webhook/line`，驗證 X-Line-Signature（System validates LINE Webhook signatures）
- [x] 6.2 實作後台管理驗證：在 `src/lib/line.ts` 建立 `sendBookingConfirmation(lineUserId, booking)` 函式，發送含服務名稱、日期、時間的 push message（System sends LINE push notification on booking confirmation）
- [x] 6.3 在 `POST /api/bookings` 成功後非同步呼叫 `sendBookingConfirmation`，通知失敗不影響主流程回應（System sends LINE push notification on booking confirmation）
- [x] 6.4 建立 `/liff/booking` 頁面：依照 LINE 整合架構，呼叫 `liff.init()` 與 `liff.getProfile()`，成功時自動帶入 LINE User ID，失敗時降級為手動輸入（LIFF app embeds the booking flow within LINE）

## 7. 前端預約流程

- [x] 7.1 建立 `/booking` 頁面：步驟一——顯示所有啟用服務（Customer can view available services）
- [x] 7.2 建立 `/booking` 頁面：步驟二——顯示日曆，標記公休日不可選（System blocks booking on holiday dates）
- [x] 7.3 建立 `/booking` 頁面：步驟三——選定日期後請求可用時段並顯示按鈕列（Customer can create a booking）
- [x] 7.4 建立 `/booking` 頁面：步驟四——輸入姓名與電話，LIFF 模式下自動取得 LINE User ID（Customer can create a booking）
- [x] 7.5 建立預約確認頁面，顯示預約成功訊息與詳細資訊

## 8. 後台管理介面（admin-panel）

- [x] 8.1 設定 Next.js middleware 對 `/admin/*` 路由執行 HTTP Basic Auth，讀取 `ADMIN_USERNAME`、`ADMIN_PASSWORD` 環境變數（Admin panel is protected by HTTP Basic Auth）
- [x] 8.2 建立 `/admin` 預約儀表板頁面：顯示當日預約清單，支援日期與狀態篩選（Admin can view bookings dashboard）
- [x] 8.3 建立 `/admin/services` 頁面：列出服務項目，提供新增與停用操作（Admin can manage service items）
- [x] 8.4 建立 `/admin/holidays` 頁面：顯示公休日清單，提供新增與刪除操作（Admin can define holiday dates）
- [x] 8.5 建立 `/admin/settings` 頁面：設定營業時間（開始/結束）與最小預約間隔，拒絕關門時間早於開門時間的設定（Admin can manage business hours settings）

## 9. 部署架構與環境設定

- [x] 9.1 建立 `.env.example` 列出部署架構所有必要環境變數：`LINE_CHANNEL_ACCESS_TOKEN`、`LINE_CHANNEL_SECRET`、`LIFF_ID`、`ADMIN_USERNAME`、`ADMIN_PASSWORD`、`DATABASE_URL`
- [x] 9.2 依照部署架構部署至 Vercel，設定環境變數，執行 production migration
- [x] 9.3 在 LINE Developers Console 設定 Webhook URL 並驗證簽名驗證正常運作（System validates LINE Webhook signatures）
- [x] 9.4 建立 LINE LIFF 應用程式，設定 LIFF URL 指向 `/liff/booking`，更新 `LIFF_ID` 環境變數

## 10. 部署後改善與 UI/UX 優化

- [x] 10.1 修正 Prisma 連線設定：`prisma/schema.prisma` 改用 `POSTGRES_PRISMA_URL`（連線池）+ `POSTGRES_URL_NON_POOLING`（直連），解決 Neon serverless 連線問題
- [x] 10.2 修正 Vercel build：`package.json` 的 `build` 腳本加入 `prisma generate`，確保 Prisma Client 在部署時正確產生
- [x] 10.3 修正 LINE push notification 時區：`src/lib/line.ts` 的 `sendBookingConfirmation` 所有日期時間格式化加入 `timeZone: "Asia/Taipei"`
- [x] 10.4 實作 LIFF 顯示名稱自動填入：`src/app/liff/booking/page.tsx` 在取得 LINE profile 後將 `displayName` 存入 `sessionStorage`；`src/app/booking/page.tsx` 初始化時讀取並自動帶入姓名欄位
- [x] 10.5 改善可用時段邏輯：`src/lib/availability.ts` 的 `calculateAllSlots` 加入 `isPast` 判斷，當日已過時段自動標記為不可用（`available: false`）
- [x] 10.6 優化步驟條 UI：`/booking` 頁面步驟指示器加入連接橫線，以 `bg-primary` / `bg-border` 區分已完成與未完成段落
- [x] 10.7 服務選單改用 Button 元件：`/booking` 步驟一將 Card 替換為 `Button`，選中時切換為 `variant="default"`，符合鍵盤無障礙操作
- [x] 10.8 新增空狀態設計：服務清單無資料時顯示圖示與提示文字，時段清單無可用時段時顯示對應提示
- [x] 10.9 新增送出失敗錯誤提示：`/booking` 步驟四送出失敗時在「確認預約」按鈕上方顯示具體錯誤訊息

## 11. 後台管理 UI/UX 改善

- [x] 11.1 新增 Admin 共用 layout（`src/app/admin/layout.tsx`），包含 header 與 `AdminNav` 導覽元件，移除各頁面重複的 header 程式碼
- [x] 11.2 新增 `AdminNav` 元件（`src/app/admin/_components/admin-nav.tsx`），使用 `usePathname` 支援當前頁面高亮顯示
- [x] 11.3 建立可複用 `DatePicker` 元件（`src/components/date-picker.tsx`），整合 shadcn Calendar + Popover，支援 `disabled` 日期規則與 Asia/Taipei 時區顯示
- [x] 11.4 服務管理頁面（`src/app/admin/services/page.tsx`）改版：使用 Field/FieldLabel、Switch 切換啟用/停用、Trash2 刪除按鈕、Item/ItemGroup 清單 UI
- [x] 11.5 新增 `PATCH /api/admin/services/[id]/activate` API（`src/app/api/admin/services/[id]/activate/route.ts`）：啟用已停用服務
- [x] 11.6 新增 `DELETE /api/admin/services/[id]` handler（`src/app/api/admin/services/[id]/route.ts`）：刪除服務，若有預約紀錄則回傳 409 拒絕刪除
- [x] 11.7 公休日管理頁面（`src/app/admin/holidays/page.tsx`）改版：使用 `DatePicker`，停用已設定日期與過去日期，改用 Item/ItemGroup 清單 UI
- [x] 11.8 修正公休日日期比對邏輯：統一以 `toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' })` 做字串比對，避免 UTC/Asia-Taipei 時區誤差
- [x] 11.9 系統設定頁面（`src/app/admin/settings/page.tsx`）改版：使用 Field/FieldLabel、InputGroup + InputGroupAddon（Clock 圖示）顯示時間欄位，隱藏原生時間選取圖示
- [x] 11.10 修正設定頁面閃爍問題：初始 state 設為 `null`，資料載入完成後才渲染表單，避免預設值閃爍
- [x] 11.11 修正 LIFF 底部多餘空間：移除 `src/app/booking/page.tsx` 容器的 `min-h-dvh`，消除卡片下方可滾動空白區域
- [x] 11.12 更新主色調為藍色系（`src/app/globals.css`），同步調整 `--primary`、`--chart`、`--sidebar-primary` 等 CSS 變數
