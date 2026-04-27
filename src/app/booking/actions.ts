'use server';

import { prisma } from '@/lib/prisma';
import { calculateAllSlots } from '@/lib/availability';
import { after } from 'next/server';
import { sendBookingConfirmation } from '@/lib/line';

export async function getAvailability(
  date: string,
  serviceId: string,
): Promise<{ slots: { time: string; available: boolean }[] }> {
  const parsedDate = new Date(`${date}T00:00:00+08:00`);

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
  });

  if (!service) return { slots: [] };

  const slots = await calculateAllSlots(parsedDate, service.durationMinutes);

  return {
    slots: slots.map((s) => ({ time: s.time.toISOString(), available: s.available })),
  };
}

export async function createBooking(data: {
  customerName: string;
  customerPhone: string;
  serviceId: string;
  startTime: string;
  lineUserId: string | null;
}): Promise<{ id: string } | { error: string }> {
  const { customerName, customerPhone, serviceId, startTime, lineUserId } = data;

  if (!customerName || !customerPhone || !serviceId || !startTime) {
    return { error: '必填欄位缺少' };
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
  });

  if (!service) return { error: '服務不存在' };

  const start = new Date(startTime);
  const end = new Date(start.getTime() + service.durationMinutes * 60_000);

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          status: 'CONFIRMED',
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (conflict) throw new Error('SLOT_CONFLICT');

      return tx.booking.create({
        data: { serviceId, customerName, customerPhone, lineUserId, startTime: start, endTime: end, status: 'CONFIRMED' },
        include: { service: { select: { name: true } } },
      });
    });

    if (lineUserId) {
      after(() => sendBookingConfirmation(lineUserId, booking).catch(console.error));
    }

    return { id: booking.id };
  } catch (err) {
    if (err instanceof Error && err.message === 'SLOT_CONFLICT') {
      return { error: '該時段已被預約，請選擇其他時段' };
    }
    return { error: '預約失敗，請稍後再試' };
  }
}
