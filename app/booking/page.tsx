"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteChrome } from "@/components/site-chrome";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Service = {
  id: string;
  nutritionist_id: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
};

type Slot = {
  id: string;
  starts_at: string;
  ends_at: string;
};

export default function BookingPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [initialServiceId, setInitialServiceId] = useState("");
  const [initialNutritionistId, setInitialNutritionistId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInitialServiceId(params.get("service") ?? "");
    setInitialNutritionistId(params.get("nutritionist") ?? "");
  }, []);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id,nutritionist_id,name_ar,name_en,description_ar,duration_minutes,price,currency")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (!active) return;
      if (error) setError(error.message);
      else {
        const nextServices = (data ?? []) as Service[];
        const filtered = initialNutritionistId
          ? nextServices.filter((item) => item.nutritionist_id === initialNutritionistId)
          : nextServices;
        setServices(filtered);
        if (initialServiceId && filtered.some((item) => item.id === initialServiceId)) {
          setServiceId(initialServiceId);
        }
      }
      setLoadingServices(false);
    }

    loadServices();
    return () => { active = false; };
  }, [supabase, initialServiceId, initialNutritionistId]);

  useEffect(() => {
    let active = true;
    setSlotId("");
    setSlots([]);

    const selected = services.find((item) => item.id === serviceId);
    if (!selected) return;

    const nutritionistId = selected.nutritionist_id;

    async function loadSlots() {
      setLoadingSlots(true);
      const { data, error } = await supabase
        .from("availability_slots")
        .select("id,starts_at,ends_at")
        .eq("nutritionist_id", nutritionistId)
        .eq("status", "open")
        .gt("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(30);

      if (!active) return;
      if (error) setError(error.message);
      else setSlots(data ?? []);
      setLoadingSlots(false);
    }

    loadSlots();
    return () => { active = false; };
  }, [serviceId, services, supabase]);

  async function submitBooking() {
    setPending(true);
    setError("");
    setMessage("");

    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims?.sub) {
      const next = `${window.location.pathname}${window.location.search}`;
      window.location.href = `/auth/login?next=${encodeURIComponent(next)}`;
      return;
    }

    const { error } = await supabase.rpc("book_appointment", {
      p_service_id: serviceId,
      p_slot_id: slotId,
      p_booking_notes: notes || null
    });

    if (error) {
      const messages: Record<string, string> = {
        not_authenticated: "يجب تسجيل الدخول أولاً لإتمام الحجز.",
        patient_account_required: "هذا الحساب لا يملك صلاحية حجز مواعيد.",
        service_not_available: "الخدمة لم تعد متاحة للحجز.",
        slot_not_available: "هذا الموعد لم يعد متاحاً. اختر موعداً آخر.",
        slot_too_short: "مدة الموعد المتاح أقصر من مدة الخدمة.",
        invalid_slot: "بيانات الموعد غير صالحة. اختر موعداً آخر."
      };
      const key = Object.keys(messages).find((item) => error.message.includes(item));
      setError(key ? messages[key] : "تعذر إتمام الحجز حالياً. حاول مرة أخرى.");
      setPending(false);
      return;
    }

    setMessage("تم تأكيد الحجز بنجاح. يمكنك متابعة الموعد من لوحة حسابك.");
    setPending(false);
    setSlotId("");
  }

  const selectedService = services.find((item) => item.id === serviceId);

  return (
    <SiteChrome>
      <main className="min-h-screen bg-[var(--background)] py-12">
      <div className="container max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-[var(--primary)]">← الرئيسية</Link>
        <h1 className="mt-5 text-4xl font-extrabold">حجز استشارة</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">
          اختر الخدمة والموعد المناسب. عملية الحجز تتحقق من توفر الموعد بشكل ذري لمنع الحجز المزدوج.
        </p>

        <section className="mt-8 rounded-3xl border border-[var(--border)] bg-white p-6 md:p-8">
          {loadingServices ? (
            <p>جارٍ تحميل الخدمات...</p>
          ) : (
            <div className="space-y-6">
              <label className="block">
                <span className="mb-2 block font-semibold">الخدمة</span>
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                  <option value="">اختر الخدمة</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name_ar} — {service.price} {service.currency} — {service.duration_minutes} دقيقة
                    </option>
                  ))}
                </select>
              </label>

              {selectedService && (
                <div className="rounded-2xl bg-[var(--background)] p-4 text-sm leading-7">
                  {selectedService.description_ar || "استشارة غذائية مخصصة حسب احتياجك."}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block font-semibold">الموعد المتاح</span>
                <select value={slotId} onChange={(e) => setSlotId(e.target.value)} disabled={!serviceId || loadingSlots}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 disabled:opacity-60">
                  <option value="">
                    {loadingSlots ? "جارٍ تحميل المواعيد..." : "اختر الموعد"}
                  </option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {new Date(slot.starts_at).toLocaleString("ar-SA", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block font-semibold">ملاحظات للحجز <span className="font-normal text-[var(--muted)]">(اختياري)</span></span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
                  placeholder="اكتب أي ملاحظة مهمة للأخصائي..." />
              </label>

              {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
              {message && <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}

              <button onClick={submitBooking} disabled={!serviceId || !slotId || pending}
                className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-bold text-white disabled:opacity-50">
                {pending ? "جارٍ تأكيد الحجز..." : "تأكيد الحجز"}
              </button>
            </div>
          )}

          {!loadingServices && services.length === 0 && !error && (
            <div className="rounded-2xl bg-amber-50 p-5 text-amber-800">
              لا توجد خدمات منشورة حالياً. أضف خدمات الأخصائيين من لوحة الإدارة.
            </div>
          )}
        </section>
      </div>
      </main>
    </SiteChrome>
  );
}
