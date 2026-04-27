'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-TW">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
          <p className="text-muted-foreground">發生錯誤，請稍後再試</p>
          <button
            className="text-sm text-primary underline underline-offset-4"
            onClick={reset}
          >
            重試
          </button>
        </div>
      </body>
    </html>
  );
}
