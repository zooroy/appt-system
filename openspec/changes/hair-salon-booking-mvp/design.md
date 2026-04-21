## Context

目前美髮店沒有線上預約系統，客戶只能電話預約。本次建立 MVP，支援 LINE LIFF 與網頁兩種預約管道，單一設計師、單一商家部署。技術棧：Next.js（App Router）、PostgreSQL（Prisma ORM）、LINE Messaging API + LIFF SDK、部署於 Vercel。

## Goals / Non-Goals

**Goals:**

- 客戶可透過 LINE LIFF 或網頁完成預約
- 系統依服務時長自動計算可用時段
- 店家後台可管理服務項目、公休日、預約記錄
- 預約成功後自動推送 LINE 通知

**Non-Goals:**

- 不支援多設計師
- 不支援線上付款
- 不支援多商家（非 SaaS）
- 不支援候補名單
- 不支援客戶帳號系統（客戶以 LINE User ID 識別）

## Decisions

### 資料庫結構設計

採用 PostgreSQL + Prisma ORM。核心資料表：

```
Service（服務項目）
  id, name, durationMinutes, description, isActive

Booking（預約）
  id, serviceId, customerName, customerPhone, lineUserId
  startTime, endTime, status（PENDING/CONFIRMED/CANCELLED）
  createdAt

Holiday（公休日）
  id, date, reason

Settings（系統設定）
  key, value（儲存營業時間起訖、預約間隔等）
```

理由：關聯式資料庫確保預約時段不重疊的完整性，Prisma 提供 TypeScript 型別安全。

替代方案：MongoDB 彈性高但難以處理時段衝突的 transaction 保證。

### 可用時段計算策略

採用「後端計算、一次性回傳當日可用列表」策略：

1. 客戶選定服務後，前端請求指定日期的可用時段
2. 後端取出該日所有已確認預約，將服務時長的滑動視窗掃描整個營業時間
3. 排除：已占用時段、距離公休日、超出營業時間的視窗
4. 回傳可用開始時間列表

時段間隔：固定 30 分鐘為最小單位（可由 Settings 設定）。

理由：前端只顯示結果，避免客戶端計算邏輯不一致。後端加悲觀鎖（SELECT FOR UPDATE）防止同時搶單。

### LINE 整合架構

```
LINE 官方帳號
  └── Rich Menu → 點選「立即預約」
        └── 開啟 LIFF URL（/liff/booking）
              └── 預約完成後關閉 LIFF
                    └── Messaging API 推送確認訊息給客戶
```

LIFF 與一般網頁共用同一套 Next.js 頁面（`/booking`），LIFF 模式下透過 `liff.init()` 取得 LINE User ID 自動帶入，一般網頁模式下手動輸入姓名電話。

### UI 元件庫選型

採用 **Tailwind CSS + shadcn/ui**，以下列指令初始化：

```bash
pnpm dlx shadcn@latest init --preset b3SReJoXo --template next
```

理由：shadcn/ui 的 Calendar、Button、Form 元件可直接用於預約流程，行動裝置友善，與 Next.js App Router 整合最順。客戶端預約頁與後台管理頁共用同一套元件系統。

### 後台管理驗證

後台採用 Next.js 內建的 HTTP Basic Auth（透過 middleware），搭配環境變數設定帳密。MVP 不建置完整帳號系統。

理由：最小實作成本，足以保護後台不被外部存取。

### 部署架構

```
Vercel（Next.js + API Routes）
  └── Vercel Postgres（PostgreSQL）
  └── LINE Messaging API（Webhook）
```

環境變數：`LINE_CHANNEL_ACCESS_TOKEN`、`LINE_CHANNEL_SECRET`、`LIFF_ID`、`ADMIN_USERNAME`、`ADMIN_PASSWORD`、`DATABASE_URL`

## Risks / Trade-offs

- [競態條件] 兩個客戶同時選同一時段 → 使用資料庫 transaction + 唯一約束（startTime 不得重疊）偵測衝突，回傳友善錯誤訊息
- [LINE Webhook 驗證] 若 Channel Secret 設定錯誤，所有 LINE 事件將被拒絕 → 部署後立即測試 Webhook 端點
- [LIFF 授權] 使用者拒絕 LINE 授權則無法取得 User ID → 降級為手動輸入模式
- [Vercel Cold Start] API 首次請求延遲較高 → MVP 階段可接受，後續可升級方案
