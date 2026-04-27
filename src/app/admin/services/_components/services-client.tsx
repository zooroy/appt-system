'use client';

import { useState, useTransition } from 'react';
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
import { activateService, createService, deactivateService, deleteService } from '../actions';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  description?: string;
  isActive: boolean;
};

export function ServicesClient({ services }: { services: Service[] }) {
  const [form, setForm] = useState({ name: '', durationMinutes: '', description: '' });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createService({
        name: form.name,
        durationMinutes: Number(form.durationMinutes),
        description: form.description,
      });
      if (result.error) setError(result.error);
      else {
        setForm({ name: '', durationMinutes: '', description: '' });
        setError('');
      }
    });
  };

  const handleToggle = (id: string, checked: boolean) => {
    startTransition(async () => {
      if (checked) {
        await activateService(id);
      } else {
        const result = await deactivateService(id);
        if (result.error) alert(result.error);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('確定要刪除此服務？')) return;
    startTransition(async () => {
      const result = await deleteService(id);
      if (result.error) alert(result.error);
    });
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
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="剪髮"
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel>時長（分鐘）</FieldLabel>
              <Input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                placeholder="60"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel>說明（選填）</FieldLabel>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            onClick={handleCreate}
            disabled={!form.name || !form.durationMinutes || isPending}
          >
            {isPending ? '處理中...' : '新增'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-lg font-semibold text-center">服務項目</h2>
          {services.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">尚無服務項目</p>
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
                      disabled={isPending}
                      onCheckedChange={(checked) => handleToggle(s.id, checked)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                      onClick={() => handleDelete(s.id)}
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
