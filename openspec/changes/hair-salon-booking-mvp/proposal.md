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
  - `src/app/api/` — API Routes（預約、服務、時段、公休日）
  - `src/lib/` — 業務邏輯（時段計算、LINE 通知）
  - `prisma/schema.prisma` — 資料庫結構
  - `src/app/liff/` — LINE LIFF 入口頁
- Dependencies: Next.js, PostgreSQL (Prisma ORM), LINE Messaging API SDK, LIFF SDK, Vercel
