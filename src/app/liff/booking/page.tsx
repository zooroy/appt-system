"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LiffBookingPage() {
  const router = useRouter();

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      router.replace("/booking");
      return;
    }

    import("@line/liff").then(({ default: liff }) => {
      liff
        .init({ liffId })
        .then(async () => {
          if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            sessionStorage.setItem("lineUserId", profile.userId);
            sessionStorage.setItem("lineDisplayName", profile.displayName);
          }
        })
        .catch(console.error)
        .finally(() => {
          router.replace("/booking");
        });
    });
  }, [router]);

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center">
      <p className="text-muted-foreground">載入中...</p>
    </div>
  );
}
