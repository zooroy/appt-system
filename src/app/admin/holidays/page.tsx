'use client';

import { useEffect, useState } from 'react';
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

type Holiday = { id: string; date: string; reason?: string };

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [form, setForm] = useState({ date: '', reason: '' });
  const [error, setError] = useState('');

  const fetchHolidays = () =>
    fetch('/api/admin/holidays')
      .then((r) => r.json())
      .then(setHolidays);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const addHoliday = async () => {
    setError('');
    const res = await fetch('/api/admin/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ date: '', reason: '' });
      fetchHolidays();
    } else {
      const data = await res.json();
      setError(data.error ?? '新增失敗');
    }
  };

  const removeHoliday = async (id: string) => {
    await fetch(`/api/admin/holidays/${id}`, { method: 'DELETE' });
    fetchHolidays();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">公休日管理</h2>
          <Field>
            <FieldLabel>日期</FieldLabel>
            <DatePicker
              value={form.date ? new Date(form.date) : undefined}
              onChange={(d) =>
                setForm({
                  ...form,
                  date: d.toLocaleDateString('sv-SE', {
                    timeZone: 'Asia/Taipei',
                  }),
                })
              }
              disabled={(d) => {
                const str = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' });
                return (
                  d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                  holidays.some(
                    (h) =>
                      new Date(h.date).toLocaleDateString('sv-SE', {
                        timeZone: 'Asia/Taipei',
                      }) === str,
                  )
                );
              }}
            />
          </Field>
          <Field>
            <FieldLabel>原因（選填）</FieldLabel>
            <Input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="農曆新年"
            />
          </Field>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button onClick={addHoliday} disabled={!form.date}>
            新增
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">公休日</h2>
          {holidays.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              尚無公休日設定
            </p>
          ) : (
            <ItemGroup>
              {holidays.map((h) => (
                <Item key={h.id} variant="outline">
                  <ItemContent>
                    <ItemTitle>
                      {new Date(h.date).toLocaleDateString('zh-TW')}
                    </ItemTitle>
                    {h.reason && <ItemDescription>{h.reason}</ItemDescription>}
                  </ItemContent>
                  <ItemActions>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeHoliday(h.id)}
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
