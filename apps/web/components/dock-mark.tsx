/** Dockyard crane mark — the container is the strategy in transit. */
export function DockMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="Dockyard"
      fill="none"
    >
      <g stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 52 V 14" />
        <path d="M14 14 H 46" />
        <path d="M20 14 L 34 8" strokeWidth={2.5} />
        <path d="M42 14 V 26" strokeWidth={3} />
        <path d="M42 26 v 3 a 4 4 0 1 1 -4 4" strokeWidth={3} />
      </g>
      <rect x="33" y="42" width="18" height="12" rx="1.5" stroke="var(--foreground)" strokeWidth={2.5} />
      <path d="M33 48 H 51" stroke="var(--border)" strokeWidth={2} />
      <path d="M10 58 H 54" stroke="var(--border-strong)" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}
