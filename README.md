# D-Nutrition-Care

منصة رقمية أصلية لخدمات التغذية والاستشارات والمتابعة.

## حالة التنفيذ
- التخطيط والمنتج: مكتمل
- وثائق الهندسة وUX وSEO والأمان: مكتملة
- PostgreSQL schema + RLS: منفذة كـ migration أولية
- Next.js/TypeScript foundation: منفذة
- واجهات MVP الأساسية: قيد الاستكمال

## التقنية
Next.js + TypeScript + Tailwind CSS + Supabase PostgreSQL/Auth/Storage.

## التشغيل
1. انسخ `.env.example` إلى `.env.local`.
2. ضع بيانات Supabase.
3. طبّق migration الموجودة في `supabase/migrations`.
4. ثبّت الحزم بـ `npm install`.
5. شغّل `npm run dev`.

## الوثائق
كل وثائق التخطيط والمتطلبات والمعمارية وقاعدة البيانات وUX وAPI والأمان وSEO والنشر موجودة في `docs/`.

## مبدأ مهم
المشروع يستلهم أنماط تجربة المستخدم العامة في منصات التغذية، لكنه يستخدم هوية وتصميمًا ومحتوى وكودًا أصليًا.
