# 預約系統 (Appointment System)

單一服務人員的線上預約系統，支援網頁與 LINE LIFF 雙管道預約。顧客可自助選擇服務、時段、填寫資料完成預約，店家透過後台管理預約、服務項目與公休日。

## 功能

### 顧客端
- 多步驟預約流程：選擇服務 → 選擇日期 → 選擇時段 → 填寫資料
- 公休日與已過時段自動停用
- 透過 LINE LIFF 開啟時自動帶入 LINE 顯示名稱
- 預約成功後發送 LINE push 通知

### 後台管理 (`/admin`)
- 預約管理：依日期、狀態篩選，支援取消預約
- 服務項目管理：新增、啟用/停用、刪除
- 公休日管理：新增、刪除
- 營業時間設定：開門/關門時間、預約間隔
- 取消預約時自動發送 LINE 通知給顧客
- HTTP Basic Auth 保護

## 技術架構

```
appt-system/
├── src/
│   ├── app/                      # Next.js 16 App Router
│   │   ├── admin/                # 後台管理（HTTP Basic Auth）
│   │   │   ├── holidays/         # 公休日管理
│   │   │   ├── services/         # 服務項目管理
│   │   │   └── settings/         # 營業時間設定
│   │   ├── api/webhook/line/     # LINE Messaging API Webhook
│   │   ├── booking/              # 顧客預約流程
│   │   │   └── confirmation/     # 預約成功確認頁
│   │   └── liff/booking/         # LINE LIFF 入口
│   ├── components/ui/            # shadcn/ui 元件
│   └── lib/
│       ├── admin-auth.ts         # Basic Auth 驗證
│       ├── availability.ts       # 可預約時段計算邏輯
│       ├── line.ts               # LINE Messaging API / LIFF SDK
│       └── prisma.ts             # Prisma Client 單例
└── prisma/
    ├── schema.prisma             # 資料模型（PostgreSQL）
    └── migrations/               # 資料庫 migration 紀錄
```

> 部署於 Vercel，樣式使用 Tailwind CSS。

### 主要套件

| 類別 | 套件 | 版本 |
|------|------|------|
| 框架 | Next.js | 16 |
| UI 語言 | React | 19 |
| 資料庫 ORM | Prisma | 5 |
| 樣式 | Tailwind CSS | 4 |
| UI 元件 | shadcn/ui + Radix UI | — |
| LINE 整合 | @line/bot-sdk | 9 |
| LINE 整合 | @line/liff | 2 |
| 日期處理 | date-fns | 4 |
| 日期選擇器 | react-day-picker | 9 |
| 圖示 | lucide-react | 1 |
| 測試 | Vitest | 4 |
| 語言 | TypeScript | 5 |

## 環境變數

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 連線字串 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API Channel Access Token |
| `LINE_CHANNEL_SECRET` | LINE Messaging API Channel Secret |
| `LIFF_ID` | LINE LIFF App ID |
| `NEXT_PUBLIC_LIFF_ID` | LINE LIFF App ID（前端可讀取） |
| `ADMIN_USERNAME` | 後台管理帳號 |
| `ADMIN_PASSWORD` | 後台管理密碼 |

## 頁面路由

| 路由 | 說明 |
|------|------|
| `/booking` | 顧客預約頁面 |
| `/booking/confirmation` | 預約成功確認頁 |
| `/liff/booking` | LINE LIFF 入口（取得 LINE 用戶資訊後跳轉至 `/booking`） |
| `/admin` | 後台預約管理 |
| `/admin/services` | 後台服務項目管理 |
| `/admin/holidays` | 後台公休日管理 |
| `/admin/settings` | 後台營業時間設定 |

## LINE 設定

1. 在 [LINE Developers Console](https://developers.line.biz/) 建立 Messaging API Channel
2. 設定 Webhook URL：`https://your-domain.com/api/webhook/line`
3. 建立 LIFF App，設定端點 URL：`https://your-domain.com/liff/booking`
4. 將 Channel Access Token、Channel Secret、LIFF ID 填入環境變數

## 操作流程

### 顧客預約

1. 進入 `/booking`（或由 LINE 開啟 `/liff/booking`）
2. 選擇服務項目
3. 選擇日期（公休日不可選）
4. 選擇時段（已過或已滿不可選）
5. 填寫姓名與電話
6. 送出後跳轉至 `/booking/confirmation`，並收到 LINE 推播通知

### 後台管理

1. 進入 `/admin`，輸入帳密通過 HTTP Basic Auth
2. 依日期、狀態篩選預約；可取消預約（顧客自動收到 LINE 通知）
3. 至 `/admin/services` 新增或啟用/停用服務項目
4. 至 `/admin/holidays` 設定公休日
5. 至 `/admin/settings` 調整開門/關門時間與預約間隔
