import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: { select: { name: true } } },
  });

  if (!booking) notFound();

  const start = new Date(booking.startTime);
  const dateStr = start.toLocaleDateString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const timeStr = start.toLocaleTimeString('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-center font-heading">
        預約確認
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            ✅ 預約成功！
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">預約編號：</span>
              {booking.id}
            </p>
            <p>
              <span className="font-medium">服務：</span>
              {booking.service.name}
            </p>
            <p>
              <span className="font-medium">姓名：</span>
              {booking.customerName}
            </p>
            <p>
              <span className="font-medium">日期：</span>
              {dateStr}
            </p>
            <p>
              <span className="font-medium">時間：</span>
              {timeStr}
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            如需取消請於 2 小時前辦理
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href="/booking">再次預約</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
