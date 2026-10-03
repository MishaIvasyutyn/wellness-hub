import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { uk } from "date-fns/locale";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES, TIME_SLOTS } from "@/lib/site";
import { cn } from "@/lib/utils";

const schema = z.object({
  full_name: z.string().trim().min(1, "Вкажіть ім’я").max(100),
  email: z.string().trim().email("Вкажіть коректну електронну пошту").max(255),
  phone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export function BookingWidget() {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 21 }, (_, i) => addDays(today, i + 1)).filter(
      (d) => d.getDay() !== 0 && d.getDay() !== 6,
    );
  }, []);
  const [serviceId, setServiceId] = useState<string>(SERVICES[0].id);
  const [day, setDay] = useState<Date>(days[0]!);
  const [time, setTime] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const service = SERVICES.find((s) => s.id === serviceId)!;
  const dateStr = format(day, "yyyy-MM-dd");

  useEffect(() => {
    setTime(null);
    supabase.rpc("get_booked_slots", { _date: dateStr }).then(({ data }) => {
      setBooked((data ?? []).map((r: { appointment_time: string }) => r.appointment_time));
    });
  }, [dateStr, done]);

  const open = TIME_SLOTS.filter((t) => !booked.includes(t)).length;

  async function submit() {
    if (!time) {
      toast.error("Спочатку оберіть час");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Перевірте дані");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
      service: service.name,
      appointment_date: dateStr,
      appointment_time: time,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Не вдалося записатися. Спробуйте ще раз.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="frost rounded-3xl p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-glacier" />
        <h3 className="mt-4 text-2xl">Запит на запис прийнято.</h3>
        <p className="mt-2 text-sm text-deep/60">
          {service.name} · {format(day, "EEEE, d MMMM", { locale: uk })} о {time}. Прийом лише за
          попереднім записом.
        </p>
        <button
          onClick={() => {
            setDone(false);
            setForm({ full_name: "", email: "", phone: "", notes: "" });
          }}
          className="mt-6 rounded-full bg-glacier px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Новий запис
        </button>
      </div>
    );
  }

  const input =
    "w-full rounded-xl frost px-4 py-3 text-sm outline-none placeholder:text-deep/40 focus:ring-2 focus:ring-aurora";

  return (
    <div className="frost rounded-3xl p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-display text-lg">Оберіть час</div>
          <div className="mt-0.5 text-xs text-deep/50">
            {format(day, "EEEE, d MMMM", { locale: uk })} · {service.short}
          </div>
        </div>
        <span className="frost shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-glacier">
          {open} вільно
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {SERVICES.map((s) => (
          <button
            key={s.id}
            onClick={() => setServiceId(s.id)}
            className={cn(
              "rounded-xl px-2 py-2.5 text-xs font-semibold leading-tight transition",
              s.id === serviceId
                ? "bg-deep text-primary-foreground"
                : "frost text-deep/60 hover:text-glacier",
            )}
          >
            {s.short}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => {
          const active = format(d, "yyyy-MM-dd") === dateStr;
          return (
            <button
              key={d.toISOString()}
              onClick={() => setDay(d)}
              className={cn(
                "min-w-[56px] shrink-0 rounded-xl py-2 text-center transition",
                active
                  ? "bg-glacier text-primary-foreground shadow-md shadow-glacier/40"
                  : "frost text-deep/60",
              )}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider">
                {format(d, "EEE", { locale: uk })}
              </div>
              <div className="font-display text-lg">{format(d, "d")}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-sm font-medium">
        {TIME_SLOTS.map((t) => {
          const taken = booked.includes(t);
          return (
            <button
              key={t}
              disabled={taken}
              onClick={() => setTime(t)}
              className={cn(
                "rounded-xl py-3 text-center transition",
                time === t
                  ? "bg-glacier font-semibold text-primary-foreground shadow-md shadow-glacier/40"
                  : "frost text-deep/50 hover:text-glacier",
                taken && "cursor-not-allowed line-through opacity-40",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {time && (
        <div className="rise mt-4 grid grid-cols-2 gap-2">
          <input
            className={cn(input, "col-span-2")}
            placeholder="Ім’я та прізвище"
            maxLength={100}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <input
            className={input}
            placeholder="Електронна пошта"
            type="email"
            maxLength={255}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={input}
            placeholder="Телефон"
            maxLength={40}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <textarea
            className={cn(input, "col-span-2 resize-none")}
            rows={2}
            placeholder="Що варто знати лікарю? (необов’язково)"
            maxLength={1000}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      )}

      <button
        onClick={submit}
        disabled={submitting || !time}
        className="mt-5 w-full rounded-xl bg-deep py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-glacier disabled:opacity-50"
      >
        {submitting ? "Надсилаємо…" : time ? `Підтвердити ${time}` : "Оберіть час, щоб продовжити"}
      </button>
      <p className="mt-3 text-center text-xs text-deep/45">
        Пн–Пт 10:00–19:00 · тільки за попереднім записом
      </p>
    </div>
  );
}
