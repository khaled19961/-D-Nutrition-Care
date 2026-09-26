import Link from "next/link";

export function CatalogEmpty({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
      <section className="storefront-section">
        <div className="container">
          <div className="empty-state">
            لا توجد بيانات منشورة في هذا القسم حالياً.
            <div style={{ marginTop: 18 }}>
              <Link href="/more" className="text-link">العودة إلى المزيد ←</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
