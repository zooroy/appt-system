import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const holidays = await prisma.holiday.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    select: { date: true },
  });
  return NextResponse.json(holidays.map((h: { date: Date }) => h.date));
}
