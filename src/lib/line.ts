import { messagingApi } from "@line/bot-sdk";

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "",
});

type BookingWithService = {
  id: string;
  startTime: Date;
  endTime: Date;
  service: { name: string };
};

export async function sendBookingConfirmation(
  lineUserId: string,
  booking: BookingWithService
): Promise<void> {
  const dateStr = booking.startTime.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Taipei",
  });
  const timeStr = booking.startTime.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  });

  await client.pushMessage({
    to: lineUserId,
    messages: [
      {
        type: "text",
        text: `✅ 預約確認\n\n服務：${booking.service.name}\n日期：${dateStr}\n時間：${timeStr}\n預約編號：${booking.id}\n\n如需取消請於 2 小時前辦理。`,
      },
    ],
  });
}
