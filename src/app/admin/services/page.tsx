'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';

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

  const activate = async (id: string) => {
    await fetch(`/api/admin/services/${id}/activate`, { method: 'PATCH' });
    fetchServices();
  };

  const deleteService = async (id: string) => {
    if (!confirm('確定要刪除此服務？')) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
    if (res.ok) fetchServices();
    else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">新增服務</h2>
          <div className="flex gap-3">
            <Field className="flex-1">
              <FieldLabel>服務名稱</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="剪髮"
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel>時長（分鐘）</FieldLabel>
              <Input
                type="number"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: e.target.value })
                }
                placeholder="60"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel>說明（選填）</FieldLabel>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            onClick={createService}
            disabled={!form.name || !form.durationMinutes}
          >
            新增
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">服務項目</h2>
          {services.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              尚無服務項目
            </p>
          ) : (
            <ItemGroup>
              {services.map((s) => (
                <Item key={s.id} variant="outline">
                  <ItemContent className={s.isActive ? '' : 'opacity-50'}>
                    <ItemTitle>{s.name}</ItemTitle>
                    <ItemDescription>
                      {s.durationMinutes} 分鐘
                      {s.description && ` · ${s.description}`}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Switch
                      checked={s.isActive}
                      onCheckedChange={(checked) =>
                        checked ? activate(s.id) : deactivate(s.id)
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteService(s.id)}
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
