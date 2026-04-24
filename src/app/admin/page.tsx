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
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { DatePicker } from '@/components/date-picker';

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
  const [status, setStatus] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refresh, setRefresh] = useState(0);

  const dateString = date.toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Taipei',
  });

  useEffect(() => {
    const params = new URLSearchParams({ date: dateString });
    if (status && status !== 'ALL') params.set('status', status);
    fetch(`/api/admin/bookings?${params}`)
      .then((r) => r.json())
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [dateString, status, refresh]);

  const cancelBooking = async (id: string) => {
    await fetch(`/api/admin/bookings/${id}/cancel`, { method: 'PATCH' });
    setRefresh((r) => r + 1);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">預約管理</h2>
          <div className="flex gap-3 mb-4">
            <Field className="flex-2">
              <FieldLabel>日期</FieldLabel>
              <DatePicker value={date} onChange={setDate} />
            </Field>
            <Field className="flex-1">
              <FieldLabel>狀態</FieldLabel>
              <Select
                value={status || 'ALL'}
                onValueChange={(v) => setStatus(v === 'ALL' ? '' : v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">全部狀態</SelectItem>
                  <SelectItem value="CONFIRMED">已確認</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
            </Field>
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
                          timeZone: 'Asia/Taipei',
                        })}{' '}
                        –{' '}
                        {end.toLocaleTimeString('zh-TW', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                          timeZone: 'Asia/Taipei',
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
