import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none";
const variants = {
  primary: "bg-accent text-white dark:text-black hover:bg-accent-hover",
  secondary: "border border-border bg-surface hover:bg-surface-2",
  danger: "bg-danger text-white dark:text-black hover:opacity-90",
  ghost: "hover:bg-surface-2",
} as const;
type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={cx(base, variants[variant], className)} />;
}

export function LinkButton({
  href,
  variant = "secondary",
  children,
  className,
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base placeholder:text-muted",
        className,
      )}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx("rounded-2xl border border-border bg-surface p-5", className)}>{children}</section>;
}

const badgeTones = {
  neutral: "bg-surface-2 text-muted",
  good: "bg-accent-soft text-accent",
  danger: "bg-danger-soft text-danger",
  warn: "bg-warn-soft text-warn-text",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeTones[tone])}>
      {children}
    </span>
  );
}

export function Notice({ tone = "warn", children }: { tone?: "warn" | "danger"; children: ReactNode }) {
  return (
    <div
      role="status"
      className={cx(
        "rounded-xl px-4 py-3 text-sm",
        tone === "warn" ? "bg-warn-soft text-warn-text" : "bg-danger-soft text-danger",
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-muted">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export { cx };
