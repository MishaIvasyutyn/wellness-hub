import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { SiteShell } from "@/components/SiteChrome";
import { postsQuery } from "@/lib/posts";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Journal — Solstice Manual Therapy" },
      { name: "description", content: "Articles on manual therapy, mobility, fascia and recovery." },
      { property: "og:title", content: "Journal — Solstice Manual Therapy" },
      { property: "og:description", content: "Articles on manual therapy, mobility, fascia and recovery." },
    ],
  }),
  component: Journal,
});

function Journal() {
  const { data: posts, isLoading } = useQuery(postsQuery());
  return (
    <SiteShell>
      <section className="py-16">
        <h1 className="rise text-5xl tracking-tight">The <span className="italic text-glacier">journal</span></h1>
        <p className="mt-4 max-w-lg text-deep/60">Notes from the treatment room on movement, tension and recovery.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {isLoading && <div className="text-deep/50">Loading…</div>}
          {(posts ?? []).map((p) => (
            <Link key={p.id} to="/journal/$slug" params={{ slug: p.slug }} className="frost rise rounded-3xl p-7 transition hover:-translate-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-glacier">
                {p.category} · {p.read_minutes} min · {format(new Date(p.created_at), "d MMM yyyy")}
              </div>
              <h2 className="mt-3 text-2xl leading-snug">{p.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-deep/60">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
