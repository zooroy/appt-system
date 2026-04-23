'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">公休日管理</h1>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          <h2 className="font-medium">新增公休日</h2>
          <div className="space-y-2">
            <Label>日期</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>原因（選填）</Label>
            <Input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="農曆新年"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button onClick={addHoliday} disabled={!form.date}>
            新增
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {holidays.length === 0 && (
          <p className="text-muted-foreground text-center">尚無公休日設定</p>
        )}
        {holidays.map((h) => (
          <Card key={h.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {new Date(h.date).toLocaleDateString('zh-TW')}
                </p>
                {h.reason && (
                  <p className="text-sm text-muted-foreground">{h.reason}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeHoliday(h.id)}
              >
                刪除
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
