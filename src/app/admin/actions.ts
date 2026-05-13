'use server';

import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/admin-auth';
import { sendBookingCancellation } from '@/lib/line';

const VALID_STATUSES = ['CONFIRMED', 'CANCELLED'] as const;
type BookingStatus = (typeof VALID_STATUSES)[number];

export async function getBookings(date: string, status?: string) {
  await verifyAdmin();
  const startOfDay = new Date(`${date}T00:00:00+08:00`);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60_000 - 1);
  const validStatus =
    status && (VALID_STATUSES as readonly string[]).includes(status)
      ? (status as BookingStatus)
      : undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: { gte: startOfDay, lte: endOfDay },
      ...(validStatus ? { status: validStatus } : {}),
    },
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      startTime: true,
      endTime: true,
      status: true,
      service: { select: { name: true } },
    },
  });

  return bookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status,
    service: b.service,
  }));
}

export async function cancelBooking(id: string): Promise<{ error?: string }> {
  await verifyAdmin();
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: { select: { name: true } } },
  });
  if (!booking) return { error: '預約不存在' };

  await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  if (booking.lineUserId) {
    after(() => sendBookingCancellation(booking.lineUserId!, booking).catch(console.error));
  }

  revalidatePath('/admin');
  return {};
}
