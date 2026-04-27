'use server';

import { after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/admin-auth';
import { sendBookingCancellation } from '@/lib/line';

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
