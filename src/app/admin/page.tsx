"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: string;
  service: { name: string };
};

export default function AdminPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = () => {
    const params = new URLSearchParams({ date });
    if (status) params.set("status", status);
    fetch(`/api/admin/bookings?${params}`)
      .then((r) => r.json())
      .then(setBookings);
  };

  useEffect(() => { fetchBookings(); }, [date, status]);

  const cancelBooking = async (id: string) => {
    await fetch(`/api/admin/bookings/${id}/cancel`, { method: "PATCH" });
    fetchBookings();
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">預約管理</h1>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin/services" className="text-primary underline">服務</Link>
          <Link href="/admin/holidays" className="text-primary underline">公休日</Link>
          <Link href="/admin/settings" className="text-primary underline">設定</Link>
        </nav>
      </div>

      <div className="flex gap-2 mb-4">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-md px-3 text-sm">
          <option value="">全部狀態</option>
          <option value="CONFIRMED">已確認</option>
          <option value="CANCELLED">已取消</option>
        </select>
      </div>

      <div className="space-y-3">
        {bookings.length === 0 && <p className="text-muted-foreground text-center py-8">當日無預約</p>}
        {bookings.map((b) => {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          return (
            <Card key={b.id}>
              <CardContent className="p-4 flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-medium">{b.customerName} · {b.customerPhone}</p>
                  <p className="text-sm text-muted-foreground">{b.service?.name}</p>
                  <p className="text-sm">{start.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })} – {end.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={b.status === "CONFIRMED" ? "default" : "secondary"}>
                    {b.status === "CONFIRMED" ? "已確認" : "已取消"}
                  </Badge>
                  {b.status === "CONFIRMED" && (
                    <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)}>取消</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
