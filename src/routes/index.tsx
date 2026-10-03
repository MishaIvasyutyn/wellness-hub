import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteChrome";
import { BookingWidget } from "@/components/BookingWidget";
import { CREDENTIALS, DOCTOR_NAME, METHOD_STEPS, METHODOLOGY, REVIEWS, SERVICES } from "@/lib/site";
import { postsQuery } from "@/lib/posts";
import hero from "@/assets/clinic-session.jpg";
import doctor from "@/assets/doctor.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Мануальна терапія — Потоцький Олександр Віталійович | Івано-Франківськ" },
      {
        name: "description",
        content:
          "Кабінет мануальної терапії лікаря-фізіотерапевта Потоцького Олександра Віталійовича. Лікування захворювань хребта. Івано-Франківськ, Незалежності, 38. Запис: +38 (066) 64-88-763.",
      },
      { property: "og:title", content: "Мануальна терапія — Потоцький Олександр Віталійович" },
      {
        property: "og:description",
        content:
          "Тут Ви знайдете інформацію про лікування захворювань хребта та інших патологій. Івано-Франківськ.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: posts } = useQuery(postsQuery(3));
  return (
    <SiteShell>
      <section id="book" className="grid items-center gap-10 py-16 md:grid-cols-2">
        <div className="rise">
          <span className="frost inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-glacier">
            Лікар-фізіотерапевт · Івано-Франківськ
          </span>
          <h1 className="mt-6 text-[44px] leading-[1.02] tracking-tight md:text-[56px]">
            Потоцький Олександр
            <br />
            <span className="italic text-glacier">Віталійович</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-deep/60">
            Тут Ви знайдете інформацію про лікування захворювань хребта та інших патологій.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <a
              href="#treatments"
              className="frost rounded-full px-6 py-3.5 text-sm font-semibold text-glacier"
            >
              Лікування
            </a>
          </div>
          <div className="mt-10 flex gap-8 text-sm">
            {[
              ["10:00–19:00", "Пн–Пт"],
              ["Вихідні", "Сб і Нд"],
              ["Запис", "лише попередній"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-2xl text-glacier">{n}</div>
                <div className="text-deep/50">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rise relative" style={{ animationDelay: "120ms" }}>
          <BookingWidget />
        </div>
      </section>

      <section className="py-6">
        <div className="frost overflow-hidden rounded-3xl p-2">
          <img
            src={hero}
            alt="Прийом у кабінеті мануальної терапії, Івано-Франківськ"
            width={1670}
            height={650}
            className="h-[420px] w-full rounded-[1.25rem] object-cover object-center"
          />
        </div>
      </section>

      <section id="treatments" className="py-10">
        <h2 className="mb-8 text-3xl">Лікування</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((s) => (
            <Link
              key={s.id}
              to="/journal/$slug"
              params={{ slug: s.slug }}
              className="frost rounded-3xl p-6 transition hover:-translate-y-1"
            >
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                width={976}
                height={650}
                className="h-40 w-full rounded-2xl object-cover"
              />
              <h3 className="mt-5 text-xl">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-deep/60">{s.blurb}</p>
              <div className="mt-4 text-sm font-semibold text-glacier">
                Тільки за попереднім записом
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="method" className="py-10">
        <h2 className="text-3xl">Як в нас відбувається лікування?</h2>
        <p className="mt-4 max-w-2xl text-deep/60">
          Після проведення діагностики встановлюється причини захворювання.
        </p>
        <p className="mt-2 max-w-2xl text-deep/60">
          Далі ми призначаємо найефективнішу методику в індивідуальному порядку
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {METHOD_STEPS.map((step) => (
            <Link
              key={step.title}
              to="/journal/$slug"
              params={{ slug: step.slug }}
              className="frost rounded-3xl p-6 transition hover:-translate-y-1"
            >
              <h3 className="text-xl">{step.title}</h3>
              <p className="mt-2 text-sm text-deep/60">{step.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="about" className="grid items-center gap-10 py-14 md:grid-cols-2">
        <div className="frost overflow-hidden rounded-3xl p-2">
          <img
            src={doctor}
            alt={DOCTOR_NAME}
            width={1145}
            height={1145}
            className="h-[460px] w-full rounded-[1.25rem] object-cover object-top"
          />
        </div>
        <div>
          <h2 className="text-3xl">Лікар-фізіотерапевт {DOCTOR_NAME}</h2>
          <p className="mt-4 text-sm leading-relaxed text-deep/60">
            Займаюсь захворюваннями хребта різної складності. Це болі в області шиї, головні болі,
            шум у вухах, порушення роботи серця, простріли в попереку або запалення сідничного
            нерва, остеохондроз, грижі різного типу та інше.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-deep/80">
            {CREDENTIALS.map((item) => (
              <li key={item} className="frost rounded-2xl px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/journal/$slug"
            params={{ slug: "pro-nas" }}
            className="mt-6 inline-block text-sm font-semibold text-glacier"
          >
            Детальніше
          </Link>
        </div>
      </section>

      <section className="py-6">
        <div className="frost rounded-3xl p-8 md:p-10">
          <h2 className="text-3xl">Методологія</h2>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-deep/80">
            {METHODOLOGY.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="frost-dark rounded-3xl p-8 text-primary-foreground md:p-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl">Для пацієнтів</h2>
              <p className="mt-1 text-sm text-primary-foreground/60">
                Для тих хто вперше стикається з мануальною терапією.
              </p>
            </div>
            <Link
              to="/journal"
              className="text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground"
            >
              Усі записи →
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {(posts ?? []).map((p) => (
              <Link
                key={p.id}
                to="/journal/$slug"
                params={{ slug: p.slug }}
                className="frost rounded-2xl p-5 text-deep transition hover:-translate-y-0.5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-glacier">
                  {p.category} · {p.read_minutes} хв
                </div>
                <div className="mt-2 font-display text-lg leading-snug">{p.title}</div>
                <div className="mt-2 line-clamp-2 text-sm text-deep/60">{p.excerpt}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="py-10">
        <h2 className="mb-8 text-3xl">Відгуки та пропозиції</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {REVIEWS.map((review) => (
            <article key={review.name + review.text.slice(0, 24)} className="frost rounded-3xl p-6">
              <div className="font-display text-lg">{review.name}</div>
              {review.location && (
                <div className="mt-1 text-sm text-deep/50">{review.location}</div>
              )}
              {review.problem && (
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-glacier">
                  Локалізація проблеми · {review.problem}
                </div>
              )}
              <p className="mt-3 text-sm leading-relaxed text-deep/80">{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
