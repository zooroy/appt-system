'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createService(form: {
  name: string;
  durationMinutes: number;
  description: string;
}): Promise<{ error?: string }> {
  if (!form.name || !form.durationMinutes) return { error: 'name 與 durationMinutes 為必填欄位' };
  if (form.durationMinutes <= 0) return { error: 'durationMinutes 必須為正整數' };

  await prisma.service.create({
    data: {
      name: form.name,
      durationMinutes: form.durationMinutes,
      description: form.description || undefined,
    },
  });

  revalidatePath('/admin/services');
  return {};
}

export async function activateService(id: string): Promise<void> {
  await prisma.service.update({ where: { id }, data: { isActive: true } });
  revalidatePath('/admin/services');
}

export async function deactivateService(id: string): Promise<{ error?: string }> {
  const activeBookings = await prisma.booking.count({
    where: { serviceId: id, status: 'CONFIRMED', startTime: { gte: new Date() } },
  });

  if (activeBookings > 0) return { error: '此服務有尚未完成的預約，無法停用' };

  await prisma.service.update({ where: { id }, data: { isActive: false } });
  revalidatePath('/admin/services');
  return {};
}

export async function deleteService(id: string): Promise<{ error?: string }> {
  const bookingCount = await prisma.booking.count({ where: { serviceId: id } });
  if (bookingCount > 0) return { error: '此服務有預約記錄，無法刪除，請改為停用' };

  await prisma.service.delete({ where: { id } });
  revalidatePath('/admin/services');
  return {};
}
