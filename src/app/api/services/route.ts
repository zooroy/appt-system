import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, durationMinutes: true, description: true },
  });
  return NextResponse.json(services);
}
