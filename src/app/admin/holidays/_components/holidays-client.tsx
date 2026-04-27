'use client';

import { useMemo, useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { DatePicker } from '@/components/date-picker';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { Trash2 } from 'lucide-react';
import { addHoliday, removeHoliday } from '../actions';

type Holiday = { id: string; date: string; reason?: string };

export function HolidaysClient({ holidays }: { holidays: Holiday[] }) {
  const [form, setForm] = useState({ date: '', reason: '' });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const todayStr = useMemo(
    () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }),
    [],
  );

  const handleAdd = () => {
    startTransition(async () => {
      const result = await addHoliday(form);
      if (result.error) setError(result.error);
      else {
        setForm({ date: '', reason: '' });
        setError('');
      }
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      await removeHoliday(id);
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">公休日管理</h2>
          <Field>
            <FieldLabel>日期</FieldLabel>
            <DatePicker
              value={form.date ? new Date(`${form.date}T12:00:00+08:00`) : undefined}
              onChange={(d) =>
                setForm({
                  ...form,
                  date: d.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }),
                })
              }
              disabled={(d) => {
                const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
                return dateStr < todayStr || holidays.some((h) => h.date === dateStr);
              }}
            />
          </Field>
          <Field>
            <FieldLabel>原因（選填）</FieldLabel>
            <Input
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="農曆新年"
            />
          </Field>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button onClick={handleAdd} disabled={!form.date || isPending}>
            {isPending ? '處理中...' : '新增'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">公休日</h2>
          {holidays.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">尚無公休日設定</p>
          ) : (
            <ItemGroup>
              {holidays.map((h) => (
                <Item key={h.id} variant="outline">
                  <ItemContent>
                    <ItemTitle>
                      {new Date(`${h.date}T12:00:00+08:00`).toLocaleDateString('zh-TW', {
                        timeZone: 'Asia/Taipei',
                      })}
                    </ItemTitle>
                    {h.reason && <ItemDescription>{h.reason}</ItemDescription>}
                  </ItemContent>
                  <ItemActions>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() => handleRemove(h.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
