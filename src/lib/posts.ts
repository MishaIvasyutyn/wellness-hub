import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LOCAL_POSTS, getLocalPost, type JournalPost } from "@/lib/journal";

const SAMPLE_SLUGS = new Set([
  "quiet-power-of-slow-pressure",
  "why-stiffness-returns-by-3pm",
  "what-fascia-actually-wants",
]);

async function publishedPosts(): Promise<JournalPost[]> {
  const localSlugs = new Set(LOCAL_POSTS.map((post) => post.slug));
  let extra: JournalPost[] = [];
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (!error && data) {
      extra = data.filter((post) => !SAMPLE_SLUGS.has(post.slug) && !localSlugs.has(post.slug));
    }
  } catch {
    extra = [];
  }
  return [...LOCAL_POSTS, ...extra];
}

export const postsQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["posts", limit ?? "all"],
    placeholderData: limit ? LOCAL_POSTS.slice(0, limit) : LOCAL_POSTS,
    queryFn: async () => {
      const posts = await publishedPosts();
      return limit ? posts.slice(0, limit) : posts;
    },
  });

export const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    placeholderData: getLocalPost(slug),
    queryFn: async (): Promise<JournalPost | null> => {
      const local = getLocalPost(slug);
      if (local) return local;
      if (SAMPLE_SLUGS.has(slug)) return null;
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch {
        return null;
      }
    },
  });
