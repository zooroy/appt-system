'use client';

import { useState, useTransition } from 'react';
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
import { saveSettings } from '../actions';

type Settings = {
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: string;
};

export function SettingsClient({ settings }: { settings: Settings }) {
  const [form, setForm] = useState(settings);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      setError('');
      setSaved(false);
      const result = await saveSettings(form);
      if (result.error) setError(result.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

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
                  onChange={(e) => setForm((f) => ({ ...f, openTime: e.target.value }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, closeTime: e.target.value }))}
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
              onChange={(e) => setForm((f) => ({ ...f, slotIntervalMinutes: e.target.value }))}
            />
          </Field>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm">設定已儲存</p>}
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? '儲存中...' : '儲存設定'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
