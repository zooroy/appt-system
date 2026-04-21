import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const holidays = await prisma.holiday.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(holidays);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, reason } = body;

  if (!date) {
    return NextResponse.json({ error: "date 為必填欄位" }, { status: 400 });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "date 格式無效" }, { status: 400 });
  }

  try {
    const holiday = await prisma.holiday.create({
      data: { date: parsedDate, reason },
    });
    return NextResponse.json(holiday, { status: 201 });
  } catch {
    return NextResponse.json({ error: "該日期已設定為公休日" }, { status: 409 });
  }
}
