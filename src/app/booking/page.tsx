'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  description?: string;
};

const STEPS = ['選擇服務', '選擇日期', '選擇時段', '填寫資料'] as const;

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [holidays, setHolidays] = useState<Date[]>([]);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>(
    [],
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then(setServices);
    fetch('/api/holidays')
      .then((r) => r.json())
      .then((dates: string[]) => setHolidays(dates.map((d) => new Date(d))));
    const storedLineUserId = sessionStorage.getItem('lineUserId');
    if (storedLineUserId) setLineUserId(storedLineUserId);
    const storedDisplayName = sessionStorage.getItem('lineDisplayName');
    if (storedDisplayName) setForm((f) => ({ ...f, name: storedDisplayName }));
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    fetch(`/api/availability?date=${dateStr}&serviceId=${selectedService.id}`)
      .then((r) => r.json())
      .then((data: { slots?: { time: string; available: boolean }[] }) =>
        setSlots(data.slots ?? []),
      );
  }, [selectedDate, selectedService]);

  const isHoliday = (date: Date) =>
    holidays.some((h) => h.toDateString() === date.toDateString());

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          serviceId: selectedService.id,
          startTime: selectedSlot,
          lineUserId,
        }),
      });
      if (res.ok) {
        const booking = await res.json();
        router.push(`/booking/confirmation?id=${booking.id}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? '預約失敗，請稍後再試');
      }
    } catch {
      setSubmitError('網路錯誤，請確認連線後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-center">線上預約</h1>
      <Card>
        <CardContent>
          <div className="flex items-start mb-6">
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div
                    className={`h-px flex-1 ${i === 0 ? 'invisible' : i <= step ? 'bg-primary' : 'bg-border'}`}
                  />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  >
                    {i + 1}
                  </div>
                  <div
                    className={`h-px flex-1 ${i === STEPS.length - 1 ? 'invisible' : i < step ? 'bg-primary' : 'bg-border'}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Step 0: 選服務 */}
          {step === 0 && (
            <div className="space-y-8">
              {services.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 opacity-40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="font-medium">目前沒有可預約的服務</p>
                  <p className="text-sm">請稍後再試，或聯繫店家了解詳情</p>
                </div>
              )}
              <div className="space-y-3">
                {services.map((s) => (
                  <Button
                    key={s.id}
                    variant={
                      selectedService?.id === s.id ? 'default' : 'outline'
                    }
                    // variant="outline"
                    className="w-full h-auto justify-between p-4"
                    onClick={() => setSelectedService(s)}
                  >
                    <div className="text-left">
                      <p className="font-medium">{s.name}</p>
                      {s.description && (
                        <p className="text-sm opacity-70">{s.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary">{s.durationMinutes} 分鐘</Badge>
                  </Button>
                ))}
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!selectedService}
                onClick={() => setStep(1)}
              >
                下一步
              </Button>
            </div>
          )}

          {/* Step 1: 選日期 */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  className="rounded-lg border [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    isHoliday(date)
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(0)}
                >
                  上一步
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  disabled={!selectedDate}
                  onClick={() => setStep(2)}
                >
                  下一步
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: 選時段 */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <div className="mb-2 text-center">
                  {slots.length === 0 && (
                    <p className="text-muted-foreground">當日無可用時段</p>
                  )}
                  {slots.length > 0 && slots.every((s) => !s.available) && (
                    <p className="text-muted-foreground">
                      當日時段已全數預約完畢
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const t = new Date(slot.time).toLocaleTimeString('zh-TW', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZone: 'Asia/Taipei',
                    });
                    return (
                      <Button
                        key={slot.time}
                        size="lg"
                        variant={
                          selectedSlot === slot.time ? 'default' : 'outline'
                        }
                        disabled={!slot.available}
                        onClick={() =>
                          slot.available && setSelectedSlot(slot.time)
                        }
                      >
                        {t}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  上一步
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                >
                  下一步
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: 填資料 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="王小明"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912345678"
                />
              </div>
              <div className="bg-muted rounded-lg p-4 text-sm space-y-1">
                <p>
                  <span className="font-medium">服務：</span>
                  {selectedService?.name}
                </p>
                <p>
                  <span className="font-medium">日期：</span>
                  {selectedDate?.toLocaleDateString('zh-TW')}
                </p>
                <p>
                  <span className="font-medium">時間：</span>
                  {selectedSlot
                    ? new Date(selectedSlot).toLocaleTimeString('zh-TW', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Taipei',
                      })
                    : ''}
                </p>
              </div>
              {submitError && (
                <p className="text-sm text-destructive text-center">
                  {submitError}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  上一步
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!form.name || !form.phone || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? '處理中...' : '確認預約'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
