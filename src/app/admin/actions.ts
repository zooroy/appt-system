'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/admin-auth';

export async function cancelBooking(id: string): Promise<{ error?: string }> {
  await verifyAdmin();
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return { error: '預約不存在' };

  await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  revalidatePath('/admin');
  return {};
}
