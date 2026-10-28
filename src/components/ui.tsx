import type { ReactNode } from "react";
import { Spinner } from "./Icons";

/** Page title with an optional line under it and actions on the right. */
export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-10 text-muted">
      <Spinner className="text-brand" size={22} />
      <span>{label}</span>
    </div>
  );
}

/** What a list shows when it is empty: what it is for and what to do next. */
export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card grid justify-items-center gap-2 px-6 py-10 text-center">
      <div className="mb-1 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand">{icon}</div>
      <p className="font-semibold text-ink">{title}</p>
      {text && <p className="max-w-xs text-sm text-muted">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children, testId }: { children: ReactNode; testId?: string }) {
  return (
    <p role="alert" className="alert-error" data-testid={testId}>
      {children}
    </p>
  );
}

/** The bottom sheet on phones, a centred dialog on wide screens. */
export function Sheet({ label, children, onClose, wide = false }: { label: string; children: ReactNode; onClose?: () => void; wide?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-40 flex animate-fade items-end justify-center bg-brand-900/55 backdrop-blur-[2px] lg:items-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={`max-h-[92vh] w-full max-w-md ${wide ? "lg:max-w-3xl" : ""} animate-sheet overflow-y-auto rounded-t-[20px] bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-overlay lg:rounded-[20px] lg:p-6`}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink-300 lg:hidden" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
