import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  ADDRESS,
  EMAIL,
  FACEBOOK,
  INSTAGRAM,
  PHONE_DISPLAY,
  PHONE_TEL,
  SITE_NAME,
} from "@/lib/site";

export function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-aurora/40 blur-[120px]" />
      <div className="absolute top-1/3 -right-24 h-[460px] w-[460px] rounded-full bg-glacier/25 blur-[130px]" />
      <div className="absolute bottom-0 left-1/4 h-[420px] w-[420px] rounded-full bg-ice/70 blur-[110px]" />
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <Backdrop />
      <div className="relative z-10 mx-auto max-w-[1180px] px-6">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}

function SiteHeader() {
  const link = "transition-colors hover:text-glacier";
  return (
    <header className="flex items-center justify-between pt-8 pb-4">
      <Link to="/" className="flex items-center gap-3">
        <div className="frost grid h-10 w-10 place-items-center rounded-xl font-display text-xl text-glacier">
          A
        </div>
        <span className="font-display text-xl tracking-tight">
          {SITE_NAME} <span className="text-glacier/70">Мануальна терапія</span>
        </span>
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-deep/70 md:flex">
        <Link to="/" hash="treatments" className={link}>
          Лікування
        </Link>
        <Link to="/journal" className={link} activeProps={{ className: "text-glacier" }}>
          Для пацієнтів
        </Link>
        <Link to="/admin" className={link}>
          Адмін
        </Link>
      </nav>
      <Link
        to="/"
        hash="book"
        className="frost-dark rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Запис
      </Link>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-deep/10 py-12 text-sm text-deep/50 md:flex-row md:items-center">
      <span className="font-display text-base text-deep">{SITE_NAME} Мануальна терапія</span>
      <div className="flex max-w-xl flex-col gap-1 md:items-center">
        <span>{ADDRESS}</span>
        <span>
          <a href={`tel:${PHONE_TEL}`} className="hover:text-glacier">
            {PHONE_DISPLAY}
          </a>
          {" · тільки за попереднім записом"}
        </span>
        <span>Пн–Пт · 10:00–19:00 · Сб–Нд вихідні</span>
        <span>
          <a href={INSTAGRAM} className="hover:text-glacier">
            Instagram
          </a>
          {" · "}
          <a href={FACEBOOK} className="hover:text-glacier">
            Facebook
          </a>
          {" · "}
          <a href={`mailto:${EMAIL}`} className="hover:text-glacier">
            {EMAIL}
          </a>
          {" · з приводу співпраці або пропозицій"}
        </span>
      </div>
      <span>© {new Date().getFullYear()}</span>
    </footer>
  );
}
