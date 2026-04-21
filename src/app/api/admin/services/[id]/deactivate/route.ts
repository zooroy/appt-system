import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const activeBookings = await prisma.booking.count({
    where: { serviceId: id, status: "CONFIRMED", startTime: { gte: new Date() } },
  });

  if (activeBookings > 0) {
    return NextResponse.json(
      { error: "此服務有尚未完成的預約，無法停用" },
      { status: 409 }
    );
  }

  const service = await prisma.service.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json(service);
}
