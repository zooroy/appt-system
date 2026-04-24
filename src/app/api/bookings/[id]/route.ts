import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: { select: { name: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "預約不存在" }, { status: 404 });
  }

  return NextResponse.json(booking);
}
