import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["CONFIRMED", "CANCELLED"] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const statusParam = searchParams.get("status");

  const bookingId = searchParams.get("bookingId");

  if (bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: { select: { name: true } } },
    });
    return NextResponse.json(booking ? [booking] : []);
  }

  const where: {
    startTime?: { gte: Date; lte: Date };
    status?: Status;
  } = {};

  if (dateParam) {
    const startOfDay = new Date(`${dateParam}T00:00:00+08:00`);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60_000 - 1);
    where.startTime = { gte: startOfDay, lte: endOfDay };
  }

  if (statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)) {
    where.status = statusParam as Status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { startTime: "asc" },
    include: { service: { select: { name: true } } },
  });

  return NextResponse.json(bookings);
}
