import { prisma } from "./prisma";

function parseTime(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function calculateAvailableSlots(
  date: Date,
  serviceDurationMinutes: number
): Promise<Date[]> {
  const [openTimeSetting, closeTimeSetting, intervalSetting] =
    await Promise.all([
      prisma.setting.findUnique({ where: { key: "openTime" } }),
      prisma.setting.findUnique({ where: { key: "closeTime" } }),
      prisma.setting.findUnique({ where: { key: "slotIntervalMinutes" } }),
    ]);

  const openTime = parseTime(openTimeSetting?.value ?? "09:00", date);
  const closeTime = parseTime(closeTimeSetting?.value ?? "18:00", date);
  const intervalMinutes = parseInt(intervalSetting?.value ?? "30", 10);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const isHoliday = await prisma.holiday.findFirst({
    where: { date: { gte: startOfDay, lte: endOfDay } },
  });

  if (isHoliday) return [];

  const existingBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      startTime: { gte: startOfDay, lte: endOfDay },
    },
    select: { startTime: true, endTime: true },
  });

  const slots: Date[] = [];
  let cursor = new Date(openTime);

  while (cursor.getTime() + serviceDurationMinutes * 60_000 <= closeTime.getTime()) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + serviceDurationMinutes * 60_000);

    const hasConflict = existingBookings.some(
      (b: { startTime: Date; endTime: Date }) => slotStart < b.endTime && slotEnd > b.startTime
    );

    if (!hasConflict) {
      slots.push(new Date(slotStart));
    }

    cursor = new Date(cursor.getTime() + intervalMinutes * 60_000);
  }

  return slots;
}
