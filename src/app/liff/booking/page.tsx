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

    (async () => {
      try {
        const { default: liff } = await import("@line/liff");
        await liff.init({ liffId });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          sessionStorage.setItem("lineUserId", profile.userId);
          sessionStorage.setItem("lineDisplayName", profile.displayName);
        }
      } catch (err) {
        console.error(err);
      } finally {
        router.replace("/booking");
      }
    })();
  }, [router]);

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center">
      <p className="text-muted-foreground">載入中...</p>
    </div>
  );
}
