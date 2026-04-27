import { prisma } from '@/lib/prisma';
import { BookingForm } from './_components/booking-form';

export const metadata = { title: '線上預約' };

export default async function BookingPage() {
  const [services, rawHolidays] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, durationMinutes: true, description: true },
    }),
    prisma.holiday.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      select: { date: true },
    }),
  ]);

  const holidays = rawHolidays.map((h) =>
    h.date.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }),
  );

  const serviceList = services.map((s) => ({
    ...s,
    description: s.description ?? undefined,
  }));

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="pb-1">
        <h1 className="text-2xl font-bold mb-2 text-center font-heading">
          線上預約
        </h1>
      </div>
      <BookingForm services={serviceList} holidays={holidays} />
    </div>
  );
}
