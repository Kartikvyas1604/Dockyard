const ABBREV = ["", "K", "M", "B", "T"] as const;

/** Abbreviate a large number: 1_234_567 -> "1.23M". Preserves sign. */
export function abbrevNumber(n: number, maxDecimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs < 1_000) return `${sign}${trimZeros(abs.toFixed(maxDecimals))}`;
  const tier = Math.min(Math.floor(Math.log10(abs) / 3), ABBREV.length - 1);
  const scaled = abs / 10 ** (tier * 3);
  return `${sign}${trimZeros(scaled.toFixed(maxDecimals))}${ABBREV[tier]}`;
}

function trimZeros(s: string): string {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

/** Format a token amount with fixed decimals for ledger display: "12,405.50". */
export function fmtAmount(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Basis points -> percent string: 30 -> "0.30%". */
export function bpsToPercent(bps: number): string {
  return `${trimZeros((bps / 100).toFixed(2))}%`;
}

/** USD compact: 1_234_567 -> "$1.23M". */
export function fmtUsd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `$${abbrevNumber(n)}`;
}

/** Shorten an address/hash: 0x1234…abcd (keeps head+tail). */
export function shortHash(hash: string, head = 6, tail = 4): string {
  if (hash.length <= head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

/** Relative time: "4m ago", "2h ago". */
export function timeAgo(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
