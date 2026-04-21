import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    return NextResponse.json({ error: "預約不存在" }, { status: 404 });
  }

  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "預約已取消" }, { status: 409 });
  }

  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
  if (booking.startTime <= twoHoursFromNow) {
    return NextResponse.json(
      { error: "距離預約時間不足 2 小時，無法取消" },
      { status: 422 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
