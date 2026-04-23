import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const bookingCount = await prisma.booking.count({ where: { serviceId: id } });
  if (bookingCount > 0) {
    return NextResponse.json(
      { error: "此服務有預約記錄，無法刪除，請改為停用" },
      { status: 409 }
    );
  }

  await prisma.service.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, durationMinutes, description } = body;

  if (durationMinutes !== undefined && (typeof durationMinutes !== "number" || durationMinutes <= 0)) {
    return NextResponse.json(
      { error: "durationMinutes 必須為正整數" },
      { status: 400 }
    );
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(durationMinutes !== undefined && { durationMinutes }),
      ...(description !== undefined && { description }),
    },
  });

  return NextResponse.json(service);
}
