import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteChrome";
import { BookingWidget } from "@/components/BookingWidget";
import { SERVICES } from "@/lib/site";
import { postsQuery } from "@/lib/posts";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solstice Manual Therapy — Book a session" },
      { name: "description", content: "Structural bodywork, myofascial release and spinal mobilisation. Book your one-on-one manual therapy session online." },
      { property: "og:title", content: "Solstice Manual Therapy — Book a session" },
      { property: "og:description", content: "Hands that restore how you move. Book manual therapy online." },
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
            Manual therapy · Est. 2014
          </span>
          <h1 className="mt-6 text-[44px] leading-[1.02] tracking-tight md:text-[56px]">
            Hands that restore<br />
            <span className="italic text-glacier">how you move.</span>
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-deep/60">
            Structural bodywork, myofascial release and spinal mobilisation — one-on-one, unhurried, and built around your body's own story.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <a href="#treatments" className="frost rounded-full px-6 py-3.5 text-sm font-semibold text-glacier">
              Explore treatments
            </a>
          </div>
          <div className="mt-10 flex gap-8 text-sm">
            {[["12k+", "sessions held"], ["4.9", "avg. rating"], ["60min", "full focus"]].map(([n, l]) => (
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
          <img src={hero} alt="Therapist working on a client's shoulder in a calm, sunlit room" width={1200} height={1408} className="h-[420px] w-full rounded-[1.25rem] object-cover object-[center_35%]" />
        </div>
      </section>

      <section id="treatments" className="py-10">
        <h2 className="mb-8 text-3xl">Treatments</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.id} className="frost rounded-3xl p-6 transition hover:-translate-y-1">
              <img src={s.image} alt={s.name} loading="lazy" width={976} height={688} className="h-40 w-full rounded-2xl object-cover" />
              <h3 className="mt-5 text-xl">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-deep/60">{s.blurb}</p>
              <div className="mt-4 flex justify-between text-sm">
                <span className="font-semibold text-glacier">${s.price}</span>
                <span className="text-deep/40">{s.minutes} min</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="frost-dark rounded-3xl p-8 text-primary-foreground md:p-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-3xl">From the journal</h2>
              <p className="mt-1 text-sm text-primary-foreground/60">Notes on movement, tension and recovery.</p>
            </div>
            <Link to="/journal" className="text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground">All posts →</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {(posts ?? []).map((p) => (
              <Link key={p.id} to="/journal/$slug" params={{ slug: p.slug }} className="frost rounded-2xl p-5 text-deep transition hover:-translate-y-0.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-glacier">{p.category} · {p.read_minutes} min</div>
                <div className="mt-2 font-display text-lg leading-snug">{p.title}</div>
                <div className="mt-2 line-clamp-2 text-sm text-deep/60">{p.excerpt}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
