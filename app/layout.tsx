import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "D-Nutrition-Care | رعاية غذائية متكاملة",
    template: "%s | D-Nutrition-Care"
  },
  description: "منصة متكاملة للتغذية والمتابعة وحجز الاستشارات مع أخصائيي التغذية.",
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
