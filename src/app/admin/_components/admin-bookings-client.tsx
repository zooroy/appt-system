'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { cancelBooking } from '../actions';

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: string;
  service: { name: string };
};

type Props = {
  bookings: Booking[];
  currentDate: string;
  currentStatus: string;
};

export function AdminBookingsClient({ bookings, currentDate, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDateChange = (d: Date) => {
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    const params = new URLSearchParams({ date: dateStr });
    if (currentStatus) params.set('status', currentStatus);
    router.push(`/admin?${params}`);
  };

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams({ date: currentDate });
    if (value !== 'ALL') params.set('status', value);
    router.push(`/admin?${params}`);
  };

  const handleCancel = (id: string) => {
    startTransition(async () => {
      await cancelBooking(id);
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">預約管理</h2>
          <div className="flex gap-3 mb-4">
            <Field className="flex-2">
              <FieldLabel>日期</FieldLabel>
              <DatePicker
                value={new Date(`${currentDate}T12:00:00+08:00`)}
                onChange={handleDateChange}
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel>狀態</FieldLabel>
              <Select
                value={currentStatus || 'ALL'}
                onValueChange={handleStatusChange}
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
                      <Badge variant={b.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {b.status === 'CONFIRMED' ? '已確認' : '已取消'}
                      </Badge>
                      {b.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isPending}
                          onClick={() => handleCancel(b.id)}
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
