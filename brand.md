# Brand — Dockyard

A professional maker's desk. A shipyard control room, not a wallet dashboard. Every pixel either carries information or gets cut.

## Voice

- Terse, active, shipyard-technical. "Ship strategy" not "Deposit funds".
- Lifecycle verbs are product language: `ship()`, `dock()`, `pull()`, `push()`, `swap()` / `quote()`.
- Never imply custody, guaranteed yield, or "risk-free". Risk lines are mandatory, not legal decoration.
- "Strategy" in technical surfaces (Aqua SDK terms). "Position" in maker-facing labels, with tooltip "Aqua strategy".

## Color

Near-black base with **one** accent: amber `#f5a524` (brass/lantern — the shipyard signal). Amber means *Shipped / Settled / Live* — never decoration. No purple, no gradients on chrome, no glassmorphism.

| Token | Value | Use |
|---|---|---|
| `background` | `#0a0a0a` | Page base |
| `surface` | `#111111` | Panels |
| `surface-sunken` | `#0d0d0d` | Inputs, table wells |
| `surface-raised` | `#161616` | Hover fills |
| `border` | `#1f1f1f` | Hairline panel borders |
| `border-strong` | `#2e2e2e` | Input borders |
| `foreground` | `#ececec` | Primary text |
| `foreground-muted` | `#8f8f8f` | Secondary text |
| `foreground-faint` | `#5c5c5c` | Placeholders, faint meta |
| `accent` | `#f5a524` | The signal |
| `success` / `destructive` | `#4ade80` / `#f87171` | Semantic only |

## Typography

- **Display: Newsreader (serif)** — large, slightly condensed, ship's-manifest authority. Landing headline, page titles.
- **Data: JetBrains Mono** — every number, address, hash, fee bps, tick. Verifiable data is mono. Small caps + letterspacing for column headers and labels.
- No Inter. No Roboto. The contrast reads "editorial authority vs. verifiable data".

## Structure & motion

- Depth comes from fine structure: hairline borders, a faint drafting grid, a horizon-line gradient behind the landing hero only.
- Dense trading-desk layout: left nav / center ship form / right FeeMirror. Ledger-like tables, right-aligned numerics.
- Motion: one staggered reveal on load (nav → desk → FeeMirror), then motion only as status feedback — toasts on ship/dock, the x402 stepper stamping `402 → paying → settled → applied`. Respect `prefers-reduced-motion`.
