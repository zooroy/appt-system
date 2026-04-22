"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Booking = {
  id: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: string;
  service: { name: string };
};

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/bookings?bookingId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBooking(data[0]);
      });
  }, [id]);

  if (!booking) {
    return <p className="text-center text-muted-foreground">載入中...</p>;
  }

  const start = new Date(booking.startTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-green-600">✅ 預約成功！</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
          <p><span className="font-medium">預約編號：</span>{booking.id}</p>
          <p><span className="font-medium">服務：</span>{booking.service?.name}</p>
          <p><span className="font-medium">姓名：</span>{booking.customerName}</p>
          <p><span className="font-medium">日期：</span>{start.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}</p>
          <p><span className="font-medium">時間：</span>{start.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })}</p>
        </div>
        <p className="text-xs text-muted-foreground text-center">如需取消請於 2 小時前辦理</p>
        <Button asChild className="w-full" variant="outline">
          <Link href="/booking">再次預約</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">預約確認</h1>
      <Suspense fallback={<p className="text-center">載入中...</p>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
