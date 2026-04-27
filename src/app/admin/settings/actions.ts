'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/admin-auth';

export async function saveSettings(form: {
  openTime: string;
  closeTime: string;
  slotIntervalMinutes: string;
}): Promise<{ error?: string }> {
  await verifyAdmin();
  if (form.openTime && form.closeTime && form.openTime >= form.closeTime) {
    return { error: '關門時間必須晚於開門時間' };
  }

  const updates = [
    { key: 'openTime', value: form.openTime },
    { key: 'closeTime', value: form.closeTime },
    { key: 'slotIntervalMinutes', value: form.slotIntervalMinutes },
  ];

  await Promise.all(
    updates.map((u) =>
      prisma.setting.upsert({
        where: { key: u.key },
        update: { value: u.value },
        create: { key: u.key, value: u.value },
      }),
    ),
  );

  revalidatePath('/admin/settings');
  return {};
}
