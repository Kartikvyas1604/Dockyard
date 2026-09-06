# Dockyard

**Self-custodial multi-strategy LP desk.** Ship 1inch Aqua SwapVM strategies straight from
your wallet (no deposit vault), steer ranges/fees with The Graph standardized DEX data, and
buy Strategy Intel per call over Hedera x402.

Not a vault. Not verify. Not a game.

## Quick start

```bash
pnpm install
pnpm dev --filter=@dockyard/web   # http://localhost:3000
```

Copy `apps/web/.env.local` from `.env.example` and fill in what you have — the UI
degrades honestly (error states, never mock data) when services aren't configured.

## Monorepo layout

```
dockyard/
├── apps/
│   ├── web/          Next.js 16 App Router — the desk
│   ├── mobile/       Expo placeholder (monitoring scope)
│   └── extension/    MV3 placeholder (x402 payment sidecar)
├── packages/
│   ├── ui/           Design tokens + atoms + Panel primitive (amber/near-black system)
│   ├── hooks/        useIntelPreview, useIntelPurchase, usePlatform, useLocalStorage
│   ├── utils/        formatters, validators (zod), storage, logger
│   ├── api/          typed client + FeeIntel types + 402 contract
│   ├── store/        zustand desk/settings stores
│   └── config/       tsconfig / eslint / prettier presets
└── .github/workflows/ci.yml   affected-only turbo CI
```

**Shared-first rule:** before writing logic in an app, ask whether it belongs in
`packages/`. If yes, it goes there. See `CONTRIBUTING.md`.

## Commands

| Task | Command |
|---|---|
| Dev (web) | `pnpm dev --filter=@dockyard/web` |
| Build all | `pnpm build` |
| Lint / typecheck / test | `pnpm lint` / `pnpm typecheck` / `pnpm test` |

## Design system

`brand.md` is the source of truth: near-black base, single amber accent (`#f5a524`,
signal only), Newsreader display / JetBrains Mono data, hairline borders over shadows,
ledger tables with right-aligned numerics, minimal motion that respects
`prefers-reduced-motion`.

## Backend API (v1)

Machine-readable contract: `GET /api/openapi`. Every error uses one envelope:
`{ error, message, requestId, retryable }` with `x-request-id` echoed on responses.

| Endpoint | Purpose | Notes |
|---|---|---|
| `GET /api/health` | Liveness | Always 200 when the runtime is up |
| `GET /api/ready` | Readiness + dependency status | 503 when core deps unconfigured |
| `POST /api/intel/preview` | Ungated intel (iteration only) | zod-validated, rate-limited, 30s TTL cache |
| `GET/POST /api/intel` | **x402-gated Strategy Intel** | 402 → pay (Blocky402, Hedera testnet) → 200; idempotent on `X-PAYMENT` retry |
| `POST /api/strategy/validate` | Ship-draft validation | Derives `strategyHash`, returns exact-allowance guidance; custody-free |

Backend hardening: per-IP sliding-window rate limits (`INTEL_RATE_LIMIT_PER_MIN`),
TTL intel cache (`INTEL_CACHE_TTL_MS`), zod-validated env + requests, structured
JSON logs with request-id correlation, security headers via middleware,
fail-closed x402 verification (unverified payment never mints intel), and a
unit test suite (`pnpm test --filter=@dockyard/web`).

Agent purchase flow: `scripts/agent-buy-intel.ts` walks
`GET → 402 → facilitator verify/settle → GET with X-PAYMENT → 200 intel`.

## Bounty map (ETHOnline 2026)

- **1inch (Aqua App):** Desk ships XYCConcentrate programs against `AquaRouter`
  (`0x1111113ccf…a90a`) / `AquaSwapVMRouter` (`0x111111338c…c0de`). Lifecycle verbs
  `ship()` / `dock()` / `pull()` / `push()` / `swap()` / `quote()` are surfaced in UI copy
  and the status log. SwapVM encode wiring lands in `apps/web/components/desk/ship-form.tsx`.
- **The Graph (Standardized Products):** `apps/web/lib/graph/standardized-query.ts` runs
  ONE query pattern (`financialsDailySnapshots`) across every `GRAPH_SUBGRAPH_URLS`
  deployment (Messari standardized DEX schema) → FeeMirror panel → "Apply to ship form".
- **Hedera (x402):** `POST /api/intel` returns a real HTTP 402 with payment requirements;
  the Pay Intel stepper walks `402 → paying → settled → applied`.

## Risk & custody language

Protocol holds zero tokens; only ERC-20 allowances to Aqua. The ship form always shows the
plain risk line (impermanent loss, underfunded strategies stop filling, approval risk).
Never claim custody, guaranteed yield, or risk-free.

## License

MIT.
