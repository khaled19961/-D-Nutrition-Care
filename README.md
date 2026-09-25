# D-Nutrition-Care

منصة رقمية أصلية لخدمات التغذية والاستشارات والمتابعة.

## حالة التنفيذ

- التخطيط والمنتج: مكتمل
- وثائق الهندسة وUX وSEO والأمان: مكتملة
- PostgreSQL schema + RLS: منفذة كـ migration أولية
- Next.js/TypeScript foundation: منفذة
- Cloudflare Workers + vinext: مهيأ
- Supabase: مهيأ كقاعدة البيانات وAuth
- واجهات المنتج واللوحات ومحرك الحجز: قيد الاستكمال

## التقنية

Next.js 16 + TypeScript + Tailwind CSS 4 + vinext + Cloudflare Workers + Supabase PostgreSQL/Auth/Storage.

## التشغيل المحلي

1. انسخ `.env.example` إلى `.env.local`.
2. ضع بيانات Supabase.
3. طبّق migrations الموجودة في `supabase/migrations`.
4. ثبّت الحزم: `npm install`.
5. شغّل Next.js التقليدي: `npm run dev`.
6. لاختبار مسار Cloudflare: `npm run check:vinext` ثم `npm run dev:vinext`.

## البناء والاستضافة

- فحص توافق vinext: `npm run check:vinext`
- بناء Workers: `npm run build:vinext`
- تشغيل Worker محليًا بعد البناء: `npm run start:vinext`
- نشر مباشر: `npm run deploy`
- نشر Preview: `npm run deploy:preview`

تفاصيل ربط GitHub مع Cloudflare Workers موجودة في `docs/CLOUDFLARE_SETUP.md`.

## متغيرات البيئة

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — سري ولا يوضع في GitHub

## الوثائق

كل وثائق التخطيط والمتطلبات والمعمارية وقاعدة البيانات وUX وAPI والأمان وSEO والنشر موجودة في `docs/`.

## مبدأ مهم

المشروع يستلهم أنماط تجربة المستخدم العامة في منصات التغذية، لكنه يستخدم هوية وتصميمًا ومحتوى وكودًا أصليًا.
