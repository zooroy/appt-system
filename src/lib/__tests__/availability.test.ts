import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../prisma", () => ({
  prisma: {
    setting: {
      findUnique: vi.fn(),
    },
    holiday: {
      findFirst: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
    },
  },
}));

import { calculateAvailableSlots } from "../availability";
import { prisma } from "../prisma";

const mockPrisma = prisma as {
  setting: { findUnique: ReturnType<typeof vi.fn> };
  holiday: { findFirst: ReturnType<typeof vi.fn> };
  booking: { findMany: ReturnType<typeof vi.fn> };
};

function makeDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00.000+08:00`);
}

const TEST_DATE = new Date("2026-04-22T00:00:00.000+08:00");

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.setting.findUnique.mockImplementation(({ where }: { where: { key: string } }) => {
    const map: Record<string, string> = {
      openTime: "09:00",
      closeTime: "18:00",
      slotIntervalMinutes: "30",
    };
    return Promise.resolve(map[where.key] ? { key: where.key, value: map[where.key] } : null);
  });
  mockPrisma.holiday.findFirst.mockResolvedValue(null);
  mockPrisma.booking.findMany.mockResolvedValue([]);
});

describe("calculateAvailableSlots", () => {
  it("正常日：回傳完整可用時段列表", async () => {
    const slots = await calculateAvailableSlots(TEST_DATE, 60);
    const times = slots.map((s) =>
      s.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Taipei" })
    );
    expect(times).toContain("09:00");
    expect(times).toContain("17:00");
    expect(times).not.toContain("17:30");
    expect(slots.length).toBe(17);
  });

  it("公休日：回傳空陣列", async () => {
    mockPrisma.holiday.findFirst.mockResolvedValue({ id: "h1", date: TEST_DATE, reason: "國定假日" });
    const slots = await calculateAvailableSlots(TEST_DATE, 60);
    expect(slots).toHaveLength(0);
  });

  it("全滿場景：所有時段都被預約，回傳空陣列", async () => {
    const bookings = [];
    const open = makeDate("2026-04-22", "09:00");
    const close = makeDate("2026-04-22", "18:00");
    let cur = new Date(open);
    while (cur < close) {
      const next = new Date(cur.getTime() + 60 * 60_000);
      bookings.push({ startTime: new Date(cur), endTime: next });
      cur = next;
    }
    mockPrisma.booking.findMany.mockResolvedValue(bookings);
    const slots = await calculateAvailableSlots(TEST_DATE, 60);
    expect(slots).toHaveLength(0);
  });

  it("服務時長超出下班時間：不包含會超時的時段", async () => {
    const slots = await calculateAvailableSlots(TEST_DATE, 180);
    const times = slots.map((s) =>
      s.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Taipei" })
    );
    expect(times).not.toContain("15:30");
    expect(times).not.toContain("16:00");
    expect(times[times.length - 1]).toBe("15:00");
  });

  it("部分時段被預約：只回傳未衝突的時段", async () => {
    mockPrisma.booking.findMany.mockResolvedValue([
      {
        startTime: makeDate("2026-04-22", "09:00"),
        endTime: makeDate("2026-04-22", "10:00"),
      },
    ]);
    const slots = await calculateAvailableSlots(TEST_DATE, 60);
    const times = slots.map((s) =>
      s.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Taipei" })
    );
    expect(times).not.toContain("09:00");
    expect(times).not.toContain("09:30");
    expect(times).toContain("10:00");
  });
});
