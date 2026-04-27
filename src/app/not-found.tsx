import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <p className="text-muted-foreground">找不到此頁面</p>
      <Link href="/booking" className="text-sm text-primary underline underline-offset-4">
        返回預約頁面
      </Link>
    </div>
  );
}
