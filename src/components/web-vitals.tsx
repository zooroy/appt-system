'use client'
import { useReportWebVitals } from 'next/web-vitals'
import { usePathname } from 'next/navigation'

const thresholds: Record<string, [number, number]> = {
  LCP:  [2500, 4000],
  CLS:  [0.1,  0.25],
  INP:  [200,  500],
  FCP:  [1800, 3000],
  TTFB: [800,  1800],
}

function getRating(name: string, value: number): string {
  const t = thresholds[name]
  if (!t) return ''
  if (value <= t[0]) return '✅ Good'
  if (value <= t[1]) return '⚠️ Needs Improvement'
  return '❌ Poor'
}

export function WebVitals() {
  const pathname = usePathname()
  useReportWebVitals((metric) => {
    const rating = getRating(metric.name, metric.value)
    console.log(`[Web Vitals] ${pathname} | ${metric.name}: ${metric.value.toFixed(2)} ${rating}`)
  })
  return null
}
