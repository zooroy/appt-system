import { prisma } from '@/lib/prisma';
import { HolidaysClient } from './_components/holidays-client';

export default async function AdminHolidaysPage() {
  const rawHolidays = await prisma.holiday.findMany({
    orderBy: { date: 'asc' },
    select: { id: true, date: true, reason: true },
  });

  const holidays = rawHolidays.map((h) => ({
    id: h.id,
    date: h.date.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }),
    reason: h.reason ?? undefined,
  }));

  return <HolidaysClient holidays={holidays} />;
}
