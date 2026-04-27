import { prisma } from '@/lib/prisma';
import { SettingsClient } from './_components/settings-client';

export default async function AdminSettingsPage() {
  const rows = await prisma.setting.findMany({ select: { key: true, value: true } });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const settings = {
    openTime: map.openTime ?? '09:00',
    closeTime: map.closeTime ?? '18:00',
    slotIntervalMinutes: map.slotIntervalMinutes ?? '30',
  };

  return <SettingsClient settings={settings} />;
}
