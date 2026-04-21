"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({ openTime: "09:00", closeTime: "18:00", slotIntervalMinutes: "30" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          openTime: data.openTime ?? "09:00",
          closeTime: data.closeTime ?? "18:00",
          slotIntervalMinutes: data.slotIntervalMinutes ?? "30",
        });
      });
  }, []);

  const save = async () => {
    setError("");
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slotIntervalMinutes: Number(form.slotIntervalMinutes) }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? "儲存失敗");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">系統設定</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>開門時間</Label>
            <Input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>關門時間</Label>
            <Input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>最小預約間隔（分鐘）</Label>
            <Input type="number" value={form.slotIntervalMinutes} min={15} step={15} onChange={(e) => setForm({ ...form, slotIntervalMinutes: e.target.value })} />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm">設定已儲存</p>}
          <Button onClick={save}>儲存設定</Button>
        </CardContent>
      </Card>
    </div>
  );
}
