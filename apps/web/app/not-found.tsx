import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-foreground-faint">
        404 — off the charts
      </p>
      <p className="font-display text-2xl tracking-tight">This berth doesn&apos;t exist</p>
      <Link
        href="/desk"
        className="inline-flex h-10 items-center border border-accent/40 bg-accent px-4 font-mono text-sm uppercase tracking-wider text-accent-foreground transition-colors duration-100 ease-out hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to the desk
      </Link>
    </div>
  );
}
