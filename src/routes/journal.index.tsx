import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteChrome";
import { postsQuery } from "@/lib/posts";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Для пацієнтів — A.M.IF. Мануальна терапія" },
      {
        name: "description",
        content:
          "Чого варто очікувати від процедури, відчуття після неї, загострення та кількість процедур. Кабінет мануальної терапії, Івано-Франківськ.",
      },
      { property: "og:title", content: "Для пацієнтів — A.M.IF. Мануальна терапія" },
      {
        property: "og:description",
        content: "Матеріали для тих, хто вперше стикається з мануальною терапією.",
      },
    ],
  }),
  component: Journal,
});

function Journal() {
  const { data: posts, isLoading } = useQuery(postsQuery());
  return (
    <SiteShell>
      <section className="py-16">
        <h1 className="rise text-5xl tracking-tight">
          Для <span className="italic text-glacier">пацієнтів</span>
        </h1>
        <p className="mt-4 max-w-lg text-deep/60">
          На цьому сайті зібрана та описана деяка корисна інформація, про нас, про деякі
          захворювання, з якими часто звертаються пацієнти, також є опис чого варто очікувати від
          процедури, для тих хто вперше стикається з мануальною терапією.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {isLoading && !posts && <div className="text-deep/50">Завантаження…</div>}
          {(posts ?? []).map((p) => (
            <Link
              key={p.id}
              to="/journal/$slug"
              params={{ slug: p.slug }}
              className="frost rise rounded-3xl p-7 transition hover:-translate-y-1"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-glacier">
                {p.category} · {p.read_minutes} хв
              </div>
              <h2 className="mt-3 text-2xl leading-snug">{p.title}</h2>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-deep/60">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
