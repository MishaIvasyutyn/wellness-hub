import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/SiteChrome";
import { postQuery } from "@/lib/posts";

export const Route = createFileRoute("/journal/$slug")({
  head: () => ({
    meta: [
      { title: "Article — Solstice Manual Therapy" },
      { name: "description", content: "Read this article from the Solstice Manual Therapy journal." },
      { property: "og:title", content: "Article — Solstice Manual Therapy" },
      { property: "og:description", content: "Read this article from the Solstice Manual Therapy journal." },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery(postQuery(slug));
  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl py-16">
        <Link to="/journal" className="text-sm font-semibold text-glacier">← Journal</Link>
        {isLoading ? (
          <p className="mt-10 text-deep/50">Loading…</p>
        ) : !post ? (
          <p className="mt-10 text-deep/60">This article could not be found.</p>
        ) : (
          <div className="rise">
            <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.15em] text-glacier">{post.category} · {post.read_minutes} min read</div>
            <h1 className="mt-4 text-5xl leading-tight tracking-tight">{post.title}</h1>
            <p className="mt-5 text-lg text-deep/60">{post.excerpt}</p>
            <div className="frost mt-10 space-y-5 rounded-3xl p-8 text-[17px] leading-relaxed text-deep/80">
              {post.content.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
            <Link to="/" hash="book" className="mt-10 inline-block rounded-full bg-glacier px-7 py-3.5 text-sm font-semibold text-primary-foreground">Reserve a time</Link>
          </div>
        )}
      </article>
    </SiteShell>
  );
}
