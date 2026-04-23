'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Clock } from 'lucide-react';

export default function AdminSettingsPage() {
  const [form, setForm] = useState<{
    openTime: string;
    closeTime: string;
    slotIntervalMinutes: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setForm({
          openTime: data.openTime ?? '09:00',
          closeTime: data.closeTime ?? '18:00',
          slotIntervalMinutes: data.slotIntervalMinutes ?? '30',
        });
      });
  }, []);

  const save = async () => {
    setError('');
    setSaved(false);
    if (!form) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        slotIntervalMinutes: Number(form.slotIntervalMinutes),
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? '儲存失敗');
    }
  };

  if (!form) return null;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">系統設定</h2>
          <div className="flex gap-3">
            <Field className="flex-1">
              <FieldLabel>開門時間</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Clock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  type="time"
                  value={form.openTime}
                  onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                  className="[&::-webkit-calendar-picker-indicator]:hidden"
                />
              </InputGroup>
            </Field>
            <Field className="flex-1">
              <FieldLabel>關門時間</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Clock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  type="time"
                  value={form.closeTime}
                  onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                  className="[&::-webkit-calendar-picker-indicator]:hidden"
                />
              </InputGroup>
            </Field>
          </div>
          <Field>
            <FieldLabel>最小預約間隔（分鐘）</FieldLabel>
            <Input
              type="number"
              value={form.slotIntervalMinutes}
              min={15}
              step={15}
              onChange={(e) =>
                setForm({ ...form, slotIntervalMinutes: e.target.value })
              }
            />
          </Field>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm">設定已儲存</p>}
          <Button onClick={save}>儲存設定</Button>
        </CardContent>
      </Card>
    </div>
  );
}
