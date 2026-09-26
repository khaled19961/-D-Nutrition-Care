"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/", "الرئيسية"],
  ["/categories", "الفئات"],
  ["/offers", "العروض"],
  ["/cart", "السلة"],
  ["/more", "المزيد"],
] as const;

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="desktop-nav" aria-label="التنقل الرئيسي">
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={pathname === href ? "active" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav" aria-label="التنقل للجوال">
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={pathname === href ? "active" : undefined}>
          <small>{label}</small>
        </Link>
      ))}
    </nav>
  );
}
