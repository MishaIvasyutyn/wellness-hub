import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const postsQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["posts", limit ?? "all"],
    queryFn: async () => {
      let q = supabase.from("posts").select("*").eq("published", true).order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
