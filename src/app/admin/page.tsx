import { prisma } from '@/lib/prisma';
import { AdminBookingsClient } from './_components/admin-bookings-client';

const VALID_STATUSES = ['CONFIRMED', 'CANCELLED'] as const;
type BookingStatus = (typeof VALID_STATUSES)[number];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const { date, status } = await searchParams;

  const dateStr =
    date ?? new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });

  const startOfDay = new Date(`${dateStr}T00:00:00+08:00`);
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
    include: { service: { select: { name: true } } },
  });

  const serializedBookings = bookings.map((b) => ({
    ...b,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
  }));

  return (
    <AdminBookingsClient
      bookings={serializedBookings}
      currentDate={dateStr}
      currentStatus={validStatus ?? ''}
    />
  );
}
