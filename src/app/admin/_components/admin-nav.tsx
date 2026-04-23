'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: '預約管理' },
  { href: '/admin/services', label: '服務' },
  { href: '/admin/holidays', label: '公休日' },
  { href: '/admin/settings', label: '設定' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 text-sm">
      {links.map(({ href, label }) => {
        const isActive =
          href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'transition-colors',
              isActive
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
