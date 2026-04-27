'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addHoliday(form: {
  date: string;
  reason: string;
}): Promise<{ error?: string }> {
  if (!form.date) return { error: 'date 為必填欄位' };

  const parsedDate = new Date(`${form.date}T00:00:00.000Z`);
  if (isNaN(parsedDate.getTime())) return { error: 'date 格式無效' };

  try {
    await prisma.holiday.create({
      data: { date: parsedDate, reason: form.reason || undefined },
    });
  } catch {
    return { error: '該日期已設定為公休日' };
  }

  revalidatePath('/admin/holidays');
  return {};
}

export async function removeHoliday(id: string): Promise<void> {
  await prisma.holiday.delete({ where: { id } });
  revalidatePath('/admin/holidays');
}
