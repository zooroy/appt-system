'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailability, createBooking } from '../actions';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  description?: string;
};

type Props = {
  services: Service[];
  holidays: string[];
};

const STEPS = ['選擇服務', '選擇日期', '選擇時段', '填寫資料'] as const;

export function BookingForm({ services, holidays }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, startSubmitTransition] = useTransition();
  const [slotsLoading, startSlotsTransition] = useTransition();

  const todayStr = useMemo(
    () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }),
    [],
  );

  const isHoliday = (date: Date) =>
    holidays.includes(date.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }));

  useEffect(() => {
    const storedLineUserId = sessionStorage.getItem('lineUserId');
    if (storedLineUserId) setLineUserId(storedLineUserId);
    const storedDisplayName = sessionStorage.getItem('lineDisplayName');
    if (storedDisplayName) setForm((f) => ({ ...f, name: storedDisplayName }));
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setSlots([]);
    const dateStr = selectedDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
    startSlotsTransition(async () => {
      const data = await getAvailability(dateStr, selectedService.id);
      setSlots(data.slots);
    });
  }, [selectedDate, selectedService]);

  const handleSubmit = () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setSubmitError(null);
    startSubmitTransition(async () => {
      const result = await createBooking({
        customerName: form.name,
        customerPhone: form.phone,
        serviceId: selectedService.id,
        startTime: selectedSlot,
        lineUserId,
      });
      if ('error' in result) {
        setSubmitError(result.error);
      } else {
        router.push(`/booking/confirmation?id=${result.id}`);
      }
    });
  };

  return (
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
            {services.length > 0 && (
              <>
                <RadioGroup
                  value={selectedService?.id ?? ''}
                  onValueChange={(id) => {
                    const found = services.find((s) => s.id === id);
                    if (found) setSelectedService(found);
                  }}
                  className="space-y-3"
                >
                  {services.map((s) => (
                    <label
                      key={s.id}
                      htmlFor={s.id}
                      className={`flex items-center justify-between w-full p-4 rounded-md border cursor-pointer transition-colors ${
                        selectedService?.id === s.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={s.id} id={s.id} />
                        <div>
                          <p className="font-medium">{s.name}</p>
                          {s.description && (
                            <p className="text-sm text-muted-foreground">
                              {s.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">{s.durationMinutes} 分鐘</Badge>
                    </label>
                  ))}
                </RadioGroup>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedService}
                  onClick={() => setStep(1)}
                >
                  下一步
                </Button>
              </>
            )}
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
                  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }) < todayStr ||
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
                {slotsLoading && (
                  <p className="text-muted-foreground">載入中...</p>
                )}
                {!slotsLoading && slots.length === 0 && (
                  <p className="text-muted-foreground">當日無可用時段</p>
                )}
                {!slotsLoading && slots.length > 0 && slots.every((s) => !s.available) && (
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
                      variant={selectedSlot === slot.time ? 'default' : 'outline'}
                      disabled={!slot.available}
                      onClick={() => slot.available && setSelectedSlot(slot.time)}
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
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="王小明"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
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
                {selectedDate?.toLocaleDateString('zh-TW', {
                  timeZone: 'Asia/Taipei',
                })}
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
  );
}
