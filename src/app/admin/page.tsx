'use client';

import { useEffect, useState } from 'react';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const today = new Date();
  const [date, setDate] = useState<Date>(today);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const dateString = date.toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Taipei',
  });

  const fetchBookings = () => {
    const params = new URLSearchParams({ date: dateString });
    if (status) params.set('status', status);
    fetch(`/api/admin/bookings?${params}`)
      .then((r) => r.json())
      .then(setBookings);
  };

  useEffect(() => {
    fetchBookings();
  }, [dateString, status]);

  const cancelBooking = async (id: string) => {
    await fetch(`/api/admin/bookings/${id}/cancel`, { method: 'PATCH' });
    fetchBookings();
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">預約管理</h1>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin/services" className="text-primary underline">
            服務
          </Link>
          <Link href="/admin/holidays" className="text-primary underline">
            公休日
          </Link>
          <Link href="/admin/settings" className="text-primary underline">
            設定
          </Link>
        </nav>
      </div>

      <Card>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('flex-1 justify-start text-left font-normal')}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {dateString}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) {
                      setDate(d);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-md px-3 text-sm"
            >
              <option value="">全部狀態</option>
              <option value="CONFIRMED">已確認</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>

          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">當日無預約</p>
          ) : (
            <ItemGroup>
              {bookings.map((b) => {
                const start = new Date(b.startTime);
                const end = new Date(b.endTime);
                return (
                  <Item key={b.id} variant="outline">
                    <ItemContent>
                      <ItemTitle>
                        {b.customerName} · {b.customerPhone}
                      </ItemTitle>
                      <ItemDescription>
                        {b.service?.name} ·{' '}
                        {start.toLocaleTimeString('zh-TW', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}{' '}
                        –{' '}
                        {end.toLocaleTimeString('zh-TW', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge
                        variant={
                          b.status === 'CONFIRMED' ? 'default' : 'secondary'
                        }
                      >
                        {b.status === 'CONFIRMED' ? '已確認' : '已取消'}
                      </Badge>
                      {b.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelBooking(b.id)}
                        >
                          取消
                        </Button>
                      )}
                    </ItemActions>
                  </Item>
                );
              })}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
