import { prisma } from "./prisma";

// Parse "HH:MM" as an offset from Taiwan midnight (UTC), returning a UTC Date.
// Uses arithmetic instead of setHours() to avoid server timezone dependency.
function parseTime(timeStr: string, taiwanMidnight: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(taiwanMidnight.getTime() + (hours * 60 + minutes) * 60_000);
}

export type Slot = { time: Date; available: boolean };

export async function calculateAllSlots(
  // date must be Taiwan local midnight expressed in UTC
  // e.g. new Date("2026-04-21T00:00:00+08:00") → 2026-04-20T16:00:00Z
  date: Date,
  serviceDurationMinutes: number
): Promise<Slot[]> {
  const [openTimeSetting, closeTimeSetting, intervalSetting] =
    await Promise.all([
      prisma.setting.findUnique({ where: { key: "openTime" } }),
      prisma.setting.findUnique({ where: { key: "closeTime" } }),
      prisma.setting.findUnique({ where: { key: "slotIntervalMinutes" } }),
    ]);

  const openTime = parseTime(openTimeSetting?.value ?? "09:00", date);
  const closeTime = parseTime(closeTimeSetting?.value ?? "18:00", date);
  const intervalMinutes = parseInt(intervalSetting?.value ?? "30", 10);

  // Derive the Taiwan date string (date param is Taiwan midnight in UTC, so +8h → UTC midnight)
  const taiwanDateKey = new Date(date.getTime() + 8 * 60 * 60_000);
  const taiwanDateStr = taiwanDateKey.toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Compare @db.Date column with exact UTC-midnight value to avoid server-timezone dependency
  const isHoliday = await prisma.holiday.findFirst({
    where: { date: new Date(`${taiwanDateStr}T00:00:00.000Z`) },
  });

  const startOfDay = date;
  const endOfDay = new Date(date.getTime() + 24 * 60 * 60_000 - 1);

  if (isHoliday) return [];

  const existingBookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      startTime: { gte: startOfDay, lte: endOfDay },
    },
    select: { startTime: true, endTime: true },
  });

  const now = new Date();
  const slots: Slot[] = [];
  let cursor = new Date(openTime);

  while (cursor.getTime() + serviceDurationMinutes * 60_000 <= closeTime.getTime()) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + serviceDurationMinutes * 60_000);

    const hasConflict = existingBookings.some(
      (b: { startTime: Date; endTime: Date }) => slotStart < b.endTime && slotEnd > b.startTime
    );
    const isPast = slotStart <= now;

    slots.push({ time: new Date(slotStart), available: !hasConflict && !isPast });
    cursor = new Date(cursor.getTime() + intervalMinutes * 60_000);
  }

  return slots;
}

export async function calculateAvailableSlots(
  date: Date,
  serviceDurationMinutes: number
): Promise<Date[]> {
  const all = await calculateAllSlots(date, serviceDurationMinutes);
  return all.filter((s) => s.available).map((s) => s.time);
}
