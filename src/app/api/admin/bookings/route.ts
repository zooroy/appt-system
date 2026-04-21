import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["CONFIRMED", "CANCELLED"] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const statusParam = searchParams.get("status");

  const where: {
    startTime?: { gte: Date; lte: Date };
    status?: Status;
  } = {};

  if (dateParam) {
    const date = new Date(dateParam);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
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
