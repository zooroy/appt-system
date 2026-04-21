import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: "openTime" },
    update: {},
    create: { key: "openTime", value: "09:00" },
  });

  await prisma.setting.upsert({
    where: { key: "closeTime" },
    update: {},
    create: { key: "closeTime", value: "18:00" },
  });

  await prisma.setting.upsert({
    where: { key: "slotIntervalMinutes" },
    update: {},
    create: { key: "slotIntervalMinutes", value: "30" },
  });

  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      { name: "剪髮", durationMinutes: 60, description: "基本剪髮造型" },
      { name: "染髮", durationMinutes: 180, description: "全頭染髮" },
      { name: "燙髮", durationMinutes: 180, description: "全頭燙髮" },
    ],
  });

  console.log("Seed completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
