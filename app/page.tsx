const services = [
  { title: "استشارات غذائية", text: "جلسات منظمة مع أخصائيي تغذية حسب احتياجك." },
  { title: "برامج غذائية", text: "خطط وجبات ومتابعة مصممة لأهدافك." },
  { title: "متابعة التقدم", text: "سجل قياساتك وأهدافك وتابع تطورك بوضوح." }
];

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-[var(--border)] bg-white">
        <div className="container flex min-h-18 items-center justify-between gap-6">
          <a href="/" className="text-xl font-bold text-[var(--primary)]">D-Nutrition-Care</a>
          <nav className="hidden gap-6 md:flex" aria-label="التنقل الرئيسي">
            <a href="/nutritionists">الأخصائيون</a>
            <a href="/programs">البرامج</a>
            <a href="/articles">المقالات</a>
            <a href="/about">من نحن</a>
          </nav>
          <div className="flex items-center gap-3"><a href="/auth/login" className="hidden rounded-xl border border-[var(--border)] px-4 py-2 font-semibold sm:inline-flex">دخول</a><a href="/booking" className="rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold text-white">احجز استشارتك</a></div>
        </div>
      </header>

      <section className="bg-white py-20">
        <div className="container grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-block rounded-full bg-emerald-50 px-4 py-2 text-sm text-[var(--primary)]">رعاية غذائية تبدأ من احتياجك</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-6xl">خطتك الغذائية ومتابعتك في مكان واحد</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
              اكتشف الأخصائي المناسب، احجز موعدك، تابع برنامجك وسجل تقدمك من خلال تجربة رقمية بسيطة وواضحة.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="/nutritionists" className="rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white">اكتشف الأخصائيين</a>
              <a href="/auth/register" className="rounded-xl border border-[var(--border)] bg-white px-6 py-3 font-semibold">ابدأ مجاناً</a>
            </div>
          </div>
          <div className="min-h-80 rounded-3xl bg-emerald-50 p-8">
            <div className="flex h-full items-end rounded-2xl border border-dashed border-emerald-200 p-6">
              <div>
                <p className="text-sm text-[var(--primary)]">رحلتك الصحية</p>
                <p className="mt-2 text-2xl font-bold">استشارة ← برنامج ← متابعة ← تقدم</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold">كل ما تحتاجه للمتابعة الغذائية</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="rounded-2xl border border-[var(--border)] bg-white p-7">
                <h3 className="text-xl font-bold">{service.title}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
