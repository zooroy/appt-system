import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAvailableSlots } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");

  if (!dateParam || !serviceId) {
    return NextResponse.json(
      { error: "date 與 serviceId 為必填參數" },
      { status: 400 }
    );
  }

  const date = new Date(dateParam);
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "date 格式無效" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
  });

  if (!service) {
    return NextResponse.json({ error: "服務不存在" }, { status: 404 });
  }

  const slots = await calculateAvailableSlots(date, service.durationMinutes);

  return NextResponse.json({ slots: slots.map((s) => s.toISOString()) });
}
