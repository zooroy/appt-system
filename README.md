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

## 技術棧

- **框架**：[Next.js](https://nextjs.org/) 16 (App Router)
- **資料庫**：PostgreSQL + [Prisma](https://www.prisma.io/) 5
- **LINE 整合**：LINE Messaging API、LINE LIFF
- **UI**：Tailwind CSS + shadcn/ui
- **部署**：Vercel

## 本地開發

### 必要條件

- Node.js 18+
- PostgreSQL
- pnpm

### 安裝

```bash
git clone https://github.com/zooroy/appt-system.git
cd appt-system
pnpm install
```

### 環境變數

複製範本並填入實際值：

```bash
cp .env.example .env
```

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 連線字串 |
| `POSTGRES_PRISMA_URL` | PostgreSQL 連線池 URL（Vercel Postgres / Neon） |
| `POSTGRES_URL_NON_POOLING` | PostgreSQL 直連 URL（migration 用） |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API Channel Access Token |
| `LINE_CHANNEL_SECRET` | LINE Messaging API Channel Secret |
| `NEXT_PUBLIC_LIFF_ID` | LINE LIFF App ID |
| `ADMIN_USERNAME` | 後台管理帳號 |
| `ADMIN_PASSWORD` | 後台管理密碼 |

### 資料庫初始化

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

### 啟動開發伺服器

```bash
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000)

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

## 部署

### Vercel

1. 將 repo 連結至 Vercel
2. 設定所有環境變數
3. 執行 production migration：

```bash
pnpm prisma migrate deploy
```

Vercel 部署時會自動執行 `prisma generate`（已設定於 `build` 指令）。
