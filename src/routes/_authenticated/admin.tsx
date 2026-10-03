import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Backdrop } from "@/components/SiteChrome";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Solstice Manual Therapy" },
      { name: "description", content: "Manage appointments and journal posts." },
      { property: "og:title", content: "Admin — Solstice Manual Therapy" },
      { property: "og:description", content: "Manage appointments and journal posts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Appt = Tables<"appointments">;
type Post = Tables<"posts">;
const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
const statusStyle: Record<string, string> = {
  pending: "text-warn bg-warn/10",
  confirmed: "text-glacier bg-glacier/10",
  completed: "text-deep/60 bg-deep/5",
  cancelled: "text-destructive bg-destructive/10",
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"appointments" | "posts">("appointments");

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user!.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Backdrop />
      <div className="relative z-10 mx-auto max-w-[1180px] px-6 py-8">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="frost grid h-10 w-10 place-items-center rounded-xl font-display text-xl text-glacier">S</div>
            <span className="font-display text-xl">Studio admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="frost rounded-full px-4 py-2 text-sm font-semibold text-glacier">View site</Link>
            <button onClick={signOut} className="frost-dark rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground">Sign out</button>
          </div>
        </header>

        {isLoading ? (
          <p className="mt-16 text-deep/50">Loading…</p>
        ) : !isAdmin ? (
          <div className="frost mt-16 rounded-3xl p-10 text-center">
            <h1 className="text-3xl">No admin access</h1>
            <p className="mt-2 text-deep/60">This account isn't the studio admin.</p>
          </div>
        ) : (
          <>
            <div className="frost mt-10 inline-flex rounded-full p-1">
              {(["appointments", "posts"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-5 py-2 text-sm font-semibold capitalize transition", tab === t ? "bg-glacier text-primary-foreground" : "text-deep/60")}>
                  {t}
                </button>
              ))}
            </div>
            {tab === "appointments" ? <Appointments /> : <Posts />}
          </>
        )}
      </div>
    </div>
  );
}

function Appointments() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const { data = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("*").order("appointment_date").order("appointment_time");
      if (error) throw error;
      return data as Appt[];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["appointments"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete this appointment?")) return;
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["appointments"] });
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const upcoming = data.filter((a) => a.appointment_date >= today && a.status !== "cancelled");
  const pending = data.filter((a) => a.status === "pending").length;
  const list = filter === "all" ? data : data.filter((a) => a.status === filter);

  return (
    <section className="mt-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[["Upcoming", upcoming.length], ["Need confirmation", pending], ["All bookings", data.length]].map(([l, n]) => (
          <div key={l} className="frost rounded-3xl p-6">
            <div className="text-sm text-deep/50">{l}</div>
            <div className="mt-1 font-display text-4xl text-glacier">{n}</div>
          </div>
        ))}
      </div>

      <div className="frost-dark mt-6 rounded-3xl p-6 text-primary-foreground md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">Bookings</h2>
          <div className="flex flex-wrap gap-1">
            {["all", ...STATUSES].map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", filter === s ? "bg-primary-foreground text-glacier" : "text-primary-foreground/60 hover:text-primary-foreground")}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          {isLoading && <p className="text-primary-foreground/60">Loading…</p>}
          {!isLoading && list.length === 0 && <p className="text-primary-foreground/60">No appointments yet.</p>}
          {list.map((a) => (
            <div key={a.id} className="frost flex flex-col gap-3 rounded-2xl p-4 text-deep md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-glacier/15 font-display text-glacier">{a.full_name[0]?.toUpperCase()}</div>
                <div>
                  <div className="font-semibold">{a.full_name}</div>
                  <div className="text-xs text-deep/50">
                    {format(new Date(a.appointment_date + "T00:00"), "EEE d MMM")} · {a.appointment_time} · {a.service}
                  </div>
                  <div className="text-xs text-deep/50">{a.email}{a.phone ? ` · ${a.phone}` : ""}</div>
                  {a.notes && <div className="mt-1 text-xs italic text-deep/60">"{a.notes}"</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", statusStyle[a.status])}>{a.status}</span>
                <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)} className="frost rounded-lg px-2 py-1.5 text-xs font-semibold text-glacier outline-none">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => remove(a.id)} className="frost rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const emptyPost = { id: "", slug: "", title: "", excerpt: "", content: "", category: "Journal", read_minutes: 4, published: true };

function Posts() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });
  const [draft, setDraft] = useState<typeof emptyPost | null>(null);
  const [saving, setSaving] = useState(false);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

  async function save() {
    if (!draft) return;
    if (!draft.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = {
      title: draft.title.trim().slice(0, 200),
      slug: draft.slug || slugify(draft.title),
      excerpt: draft.excerpt.slice(0, 500),
      content: draft.content.slice(0, 20000),
      category: draft.category.slice(0, 40) || "Journal",
      read_minutes: Math.max(1, Math.min(60, Number(draft.read_minutes) || 4)),
      published: draft.published,
      updated_at: new Date().toISOString(),
    };
    const { error } = draft.id
      ? await supabase.from("posts").update(payload).eq("id", draft.id)
      : await supabase.from("posts").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(draft.id ? "Post updated" : "Post published");
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
    qc.invalidateQueries({ queryKey: ["posts"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  const input = "w-full rounded-xl frost px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-aurora";

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="frost rounded-3xl p-5">
        <button onClick={() => setDraft({ ...emptyPost })} className="w-full rounded-xl bg-glacier py-3 text-sm font-semibold text-primary-foreground">+ New post</button>
        <div className="mt-4 space-y-2">
          {data.map((p) => (
            <button key={p.id} onClick={() => setDraft({ ...p })} className={cn("w-full rounded-2xl p-4 text-left transition", draft?.id === p.id ? "bg-glacier/10 ring-1 ring-glacier/30" : "hover:bg-glacier/5")}>
              <div className="text-sm font-semibold">{p.title}</div>
              <div className="mt-1 text-xs text-deep/50">{p.published ? "Published" : "Draft"} · {format(new Date(p.updated_at), "d MMM")}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="frost-dark rounded-3xl p-6 md:p-8">
        {!draft ? (
          <div className="grid h-full min-h-[300px] place-items-center text-center text-primary-foreground/70">
            <div>
              <h2 className="text-2xl text-primary-foreground">Edit a post</h2>
              <p className="mt-2 text-sm">Pick a post on the left, or create a new one.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="mb-2 text-2xl text-primary-foreground">{draft.id ? "Edit post" : "New post"}</h2>
            <input className={input} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <input className={input} placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
              <input className={input} type="number" min={1} max={60} placeholder="Read minutes" value={draft.read_minutes} onChange={(e) => setDraft({ ...draft, read_minutes: Number(e.target.value) })} />
              <label className="frost flex items-center gap-2 rounded-xl px-4 text-sm font-semibold text-deep">
                <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> Published
              </label>
            </div>
            <textarea className={cn(input, "resize-none")} rows={2} placeholder="Short summary" value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
            <textarea className={cn(input, "min-h-[280px]")} placeholder="Write your post. Leave an empty line between paragraphs." value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={save} disabled={saving} className="rounded-lg bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-glacier disabled:opacity-50">
                {saving ? "Saving…" : draft.id ? "Update post" : "Publish post"}
              </button>
              <button onClick={() => setDraft(null)} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground/70">Cancel</button>
              {draft.id && (
                <>
                  <Link to="/journal/$slug" params={{ slug: draft.slug }} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground/70">Preview</Link>
                  <button onClick={() => remove(draft.id)} className="ml-auto rounded-lg px-5 py-2.5 text-sm font-semibold text-destructive-foreground/80">Delete</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
