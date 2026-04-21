import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    return NextResponse.json({ error: "預約不存在" }, { status: 404 });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
