<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Data access uses the browser backend client with RLS (public booking insert, admin-only reads via has_role); the first signed-up account becomes admin via a DB trigger — keeps admin setup zero-config.

## Cursor Cloud specific instructions

- Install with Bun (`bun.lock`): `bun install --frozen-lockfile`. Put `bun` on the default PATH via `/usr/local/bin`; login shells skip `~/.bashrc`.
- Dev server: `bun run dev` (Vite, port 8080). Public Supabase URL and publishable key are already in `.env`.
- `bun run build` is the production build. The booking widget reads live slots from hosted Supabase; do not insert test appointments.
