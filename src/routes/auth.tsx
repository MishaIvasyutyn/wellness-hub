import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Backdrop } from "@/components/SiteChrome";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Solstice Manual Therapy" },
      { name: "description", content: "Sign in to manage appointments and journal posts." },
      { property: "og:title", content: "Admin sign in — Solstice Manual Therapy" },
      { property: "og:description", content: "Sign in to manage appointments and journal posts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Check your email to confirm your account.");
      setMode("in");
    }
  }

  const input = "w-full rounded-xl frost px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-aurora";
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-6">
      <Backdrop />
      <form onSubmit={submit} className="frost rise relative z-10 w-full max-w-sm rounded-3xl p-8">
        <div className="frost grid h-10 w-10 place-items-center rounded-xl font-display text-xl text-glacier">S</div>
        <h1 className="mt-5 text-3xl">{mode === "in" ? "Welcome back" : "Create admin account"}</h1>
        <p className="mt-1 text-sm text-deep/50">Studio admin for Solstice.</p>
        <div className="mt-6 space-y-3">
          <input className={input} type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button disabled={busy} className="mt-5 w-full rounded-xl bg-deep py-3.5 text-sm font-semibold text-primary-foreground hover:bg-glacier disabled:opacity-50">
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-xs font-semibold text-glacier">
          {mode === "in" ? "First time? Create the admin account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
