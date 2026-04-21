import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/line";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerPhone, serviceId, startTime, lineUserId } = body;

  if (!customerName || !customerPhone || !serviceId || !startTime) {
    return NextResponse.json(
      {
        error: "必填欄位缺少",
        missing: [
          !customerName && "customerName",
          !customerPhone && "customerPhone",
          !serviceId && "serviceId",
          !startTime && "startTime",
        ].filter(Boolean),
      },
      { status: 400 }
    );
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId, isActive: true },
  });

  if (!service) {
    return NextResponse.json({ error: "服務不存在" }, { status: 404 });
  }

  const start = new Date(startTime);
  const end = new Date(start.getTime() + service.durationMinutes * 60_000);

  try {
    const booking = await prisma.$transaction(async (tx: typeof prisma) => {
      const conflict = await tx.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM bookings
        WHERE status = 'CONFIRMED'
          AND start_time < ${end}
          AND end_time > ${start}
        FOR UPDATE
      `;

      if (Number(conflict[0].count) > 0) {
        throw new Error("SLOT_CONFLICT");
      }

      return tx.booking.create({
        data: {
          serviceId,
          customerName,
          customerPhone,
          lineUserId,
          startTime: start,
          endTime: end,
          status: "CONFIRMED",
        },
        include: { service: { select: { name: true } } },
      });
    });

    if (lineUserId) {
      sendBookingConfirmation(lineUserId, booking).catch(console.error);
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "SLOT_CONFLICT") {
      return NextResponse.json(
        { error: "該時段已被預約，請選擇其他時段" },
        { status: 409 }
      );
    }
    throw err;
  }
}
