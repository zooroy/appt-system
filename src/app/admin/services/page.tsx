'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  description?: string;
  isActive: boolean;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    name: '',
    durationMinutes: '',
    description: '',
  });
  const [error, setError] = useState('');

  const fetchServices = () =>
    fetch('/api/admin/services')
      .then((r) => r.json())
      .then(setServices);

  useEffect(() => {
    fetchServices();
  }, []);

  const createService = async () => {
    setError('');
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        durationMinutes: Number(form.durationMinutes),
      }),
    });
    if (res.ok) {
      setForm({ name: '', durationMinutes: '', description: '' });
      fetchServices();
    } else {
      const data = await res.json();
      setError(data.error ?? '建立失敗');
    }
  };

  const deactivate = async (id: string) => {
    const res = await fetch(`/api/admin/services/${id}/deactivate`, {
      method: 'PATCH',
    });
    if (res.ok) fetchServices();
    else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">服務項目管理</h1>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          <h2 className="font-medium">新增服務</h2>
          <div className="space-y-2">
            <Label>服務名稱</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="剪髮"
            />
          </div>
          <div className="space-y-2">
            <Label>時長（分鐘）</Label>
            <Input
              type="number"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: e.target.value })
              }
              placeholder="60"
            />
          </div>
          <div className="space-y-2">
            <Label>說明（選填）</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            onClick={createService}
            disabled={!form.name || !form.durationMinutes}
          >
            新增
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{s.name}</p>
                {s.description && (
                  <p className="text-sm text-muted-foreground">
                    {s.description}
                  </p>
                )}
                <Badge variant="secondary" className="mt-1">
                  {s.durationMinutes} 分鐘
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.isActive ? 'default' : 'secondary'}>
                  {s.isActive ? '啟用' : '停用'}
                </Badge>
                {s.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deactivate(s.id)}
                  >
                    停用
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
