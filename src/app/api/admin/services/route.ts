import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, durationMinutes, description } = body;

  if (!name || !durationMinutes) {
    return NextResponse.json(
      { error: "name 與 durationMinutes 為必填欄位" },
      { status: 400 }
    );
  }

  if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
    return NextResponse.json(
      { error: "durationMinutes 必須為正整數" },
      { status: 400 }
    );
  }

  const service = await prisma.service.create({
    data: { name, durationMinutes, description },
  });

  return NextResponse.json(service, { status: 201 });
}

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(services);
}
