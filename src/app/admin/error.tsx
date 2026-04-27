'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-4 max-w-2xl mx-auto text-center space-y-4 pt-16">
      <p className="text-muted-foreground">發生錯誤，請稍後再試</p>
      <button
        className="text-sm text-primary underline underline-offset-4"
        onClick={reset}
      >
        重試
      </button>
    </div>
  );
}
