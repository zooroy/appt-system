import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.setting.findMany();
  const result = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]));
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { openTime, closeTime, slotIntervalMinutes } = body;

  if (openTime && closeTime && openTime >= closeTime) {
    return NextResponse.json(
      { error: "關門時間必須晚於開門時間" },
      { status: 400 }
    );
  }

  const updates: { key: string; value: string }[] = [];
  if (openTime) updates.push({ key: "openTime", value: openTime });
  if (closeTime) updates.push({ key: "closeTime", value: closeTime });
  if (slotIntervalMinutes) updates.push({ key: "slotIntervalMinutes", value: String(slotIntervalMinutes) });

  await Promise.all(
    updates.map((u) =>
      prisma.setting.upsert({
        where: { key: u.key },
        update: { value: u.value },
        create: { key: u.key, value: u.value },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
