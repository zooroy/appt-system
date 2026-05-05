'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

const THRESHOLD = 70;
const MAX_PULL = 80;

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pullY, setPullY] = useState(0);

  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullYRef = useRef(0);
  const isPendingRef = useRef(false);

  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isPendingRef.current) {
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0 && window.scrollY === 0) {
        e.preventDefault();
        const clamped = Math.min(delta, MAX_PULL);
        pullYRef.current = clamped;
        setPullY(clamped);
      } else {
        pullingRef.current = false;
        pullYRef.current = 0;
        setPullY(0);
      }
    };

    const handleTouchEnd = () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      if (pullYRef.current >= THRESHOLD) {
        startTransition(() => router.refresh());
      }
      pullYRef.current = 0;
      setPullY(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const indicatorTranslateY = isPending ? 16 : pullY * 0.5 - 40;
  const opacity = isPending ? 1 : Math.min(pullY / THRESHOLD, 1);

  return (
    <>
      <div
        aria-hidden
        className="fixed top-0 left-1/2 z-50 pointer-events-none"
        style={{
          transform: `translateX(-50%) translateY(${indicatorTranslateY}px)`,
          opacity,
          transition: isPending ? 'transform 0.2s ease' : undefined,
        }}
      >
        <div
          className={`w-8 h-8 rounded-full border-2 border-foreground/20 border-t-foreground bg-background shadow ${
            isPending ? 'animate-spin' : ''
          }`}
        />
      </div>
      {children}
    </>
  );
}
