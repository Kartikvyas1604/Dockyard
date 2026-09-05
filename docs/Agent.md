# agent.md — Dockyard

> Build-ready spec for a coding agent. Zero other context required.
> COS PASS: 2026-09-05 · Source: Ideation Validator packet + COS freeze
> Track: ETHOnline 2026 From Scratch · Deadline: Sun Sep 13 2026 12:00pm EDT

---

## One-Liner

**Dockyard** is a self-custodial multi-strategy LP desk: makers ship sophisticated **1inch Aqua SwapVM** positions from wallet balances (no deposit vault), steer ranges/fees with **The Graph** standardized DEX data, and buy Strategy Intel per-call via **Hedera x402**.

Alias: Shipwright-class Aqua maker desk. Not a vault. Not verify. Not a game.

---

## Problem & Target User

### Problem
Active Aqua makers and treasury LPs want concentrated / programmable fee capture without (a) depositing into Gamma/Arrakis-style vaults or (b) babysitting thin native Aqua UI. Passive Uni V3 LPs lose fees to JIT (up to ~44% cited in 1inch / academic work). Aqua keeps tokens in-wallet and lets one balance back many strategies (Shared Liquidity Ratio), but composing SwapVM programs + knowing where fees are across DEXes is still manual.

### Target user (first customer)
**Aqua maker** — active DeFi LP / small treasury ops with ≥~$10k stable+ETH inventory, already shipping or evaluating Aqua positions. Reachable via Aqua leaderboard, 1inch Discord #builders, ETHOnline channels.

### JTBD
"Earn swap fees on my balances without depositing into a vault and without splitting capital across five pools — give me a desk that ships a real SwapVM strategy and tells me where fees are."

### Wedge vs status quo
| Status quo | Dockyard |
|---|---|
| Uni V3 NFT babysitting | SwapVM program ship from wallet |
| Gamma / Arrakis deposit vaults | Self-custody; Aqua virtual balances only |
| Alps / AgentVault showcase pattern | No ERC-4626 custody; no agent-deposit hop |
| 1inch.com/aqua thin UI | Strategy desk + Graph-written params + paid intel |

### Replaces
Manual range tuning + vault deposits + spreadsheet fee hunting.


---

## Hackathon & Bounty Fit (exactly 3 partners)

| # | Partner | Prize track | Load-bearing use in product |
|---|---|---|---|
| 1 | **Hedera** | AI & Agentic Payments / x402 ($6k pool, up to 3×$2k) | Live **x402-gated Strategy Intel** API on Hedera (Blocky402 facilitator). Desk UI and/or demo agent complete ≥1 real paid request. Intel output **writes ship params** — not a side demo. |
| 2 | **The Graph** | **Best Use of Composable/Standardized Graph Products** ($5k) | Live Subgraph Studio queries against **Messari Standardized DEX subgraphs** (or equivalent standardized schema): compose cross-protocol fee/volume signals into the FeeMirror panel. No mocks. Standards leverage must be obvious in demo (one query pattern → many protocols → ship form). |
| 3 | **1inch** | Build an Aqua App ($5k; SwapVM scored higher) | Custom Aqua app: Path B SwapVM (compose existing opcodes), `ship()`/`dock()` against official Aqua/SwapVM contracts, on-chain token transfer demo (**local fork OK**), multi-commit git history. |

**Out of scope (COS freeze):** ENS, Chainlink, Hedera ATS/tokenization, Hedera Harness OSS, Continuity tracks, Graph AI track (unless a real NL copilot ships — default **Standardized Products only**).

**Judging north star (ETHOnline):** unique, solves a real problem, do not copy past showcase winners (AgentVault / Alps / ZENITH / FluxSettle deposit+agent patterns). Idea + implementation > prototype theater.

---

## Market Validation Summary

| Field | Value |
|---|---|
| Venture Readiness | **72/100** · Mixed-leaning-strong |
| Why now | Aqua public Jul 28 2026; ~$520M wallet-filled volume / ~600 makers / ~4,500 positions by early Sep 2026 |
| Biggest risk | Solo ~8-day clock with 3 load-bearing legs (SwapVM + Graph + x402) |
| Cheapest test | Fork demo of one SwapVM strategy + cold-DM 10 Aqua leaderboard makers with a Loom |
| Demand evidence | JIT fee skim + fragmentation tax on LPs (1inch blog, arXiv); capital already on Aqua |
| Weak / unproven | Willingness to pay Dockyard specifically (x402) — test with maker DMs |
| Honesty | No win guarantee. Founder contact with LP pain still required. |

Pillars (Validator): Problem 8 · Timing 8 · Competition 7 · Customer 7 · GTM 7 · Execution 6 · Unit econ 6.

Named competitors: Arrakis Pro, Gamma, Alps/GhostVault/AgentVault (showcase), native 1inch Aqua UI.


---

## MVP vs Stretch — User Stories

### MVP (must ship by deadline — scope freeze)

1. **As a maker**, I connect a wallet, approve a token to Aqua, and `ship()` **one** SwapVM strategy type (prefer **XYCConcentrate** concentrated liquidity program; XYC plain AMM acceptable fallback) via official Aqua/SwapVM contracts.
2. **As a maker**, I see pullable vs shared liquidity (SLR framing) and editable strategy params before ship.
3. **As a maker**, I open the **FeeMirror** panel: Graph standardized DEX fee/volume intel suggests params that **auto-write into the ship form** (concentrated range / fee hints). I can override before ship.
4. **As a maker or agent**, I call Strategy Intel over **Hedera x402**, pay once (HBAR or HTS as facilitator supports), and receive the same intel payload the UI used — end-to-end paid request visible in demo.
5. **As a judge**, I watch a **≤5 min** demo (prefer 2–4 for Graph band): connect → Graph params fill → ship → taker fill on **local fork** (resolvers gate production) → x402 paid intel.
6. **As a judge**, I clone a public GitHub repo with **multi-commit history** (no single-commit day dump) and a README that maps each bounty leg.

### Stretch (only if MVP green before Thu Sep 11)

- Custom SwapVM opcode / Extruction Path C
- Multi-strategy shared-balance dashboard (true SLR > 1 across ≥2 strategies)
- Maker leaderboard overlay from Aqua APIs
- Natural-language strategy copilot (would unlock Graph AI track — **do not start** unless Standardized track already solid)
- Template marketplace take-rate post-hackathon

### Explicit non-goals (forbidden)
- Verify / KYC / World / selfie / humanity proofs
- 3D games, gamification jokes, play-to-earn wrappers
- ERC-4626 / deposit vault / AgentVault clones
- Hedera ATS collateral desk
- ENS naming as a product pillar; Chainlink oracles as a product pillar

---

## Non-Functionals

| NFR | Requirement |
|---|---|
| Custody | Protocol holds 0 tokens; only ERC-20 allowances to Aqua |
| Chains (MVP) | One EVM chain for Aqua demo (prefer **Ethereum mainnet fork** via Anvil/Hardhat; document chain id). Hedera **testnet** for x402 settlement |
| Latency | Graph panel refresh < 3s perceived; x402 round-trip shown in UI with status states |
| Security | No private keys in repo; env for Graph API key + Hedera account; warn on unlimited approvals |
| Demo reliability | Scripted fork scenario with funded maker + mock taker path; record backup Loom before live judging |
| Accessibility | Keyboard-usable primary flows; high contrast near-black UI |
| License | MIT (or Apache-2.0 if dependency forces) — state in README |
| Commit hygiene | ≥1 meaningful commit per day from first code day; never squash to one commit |


---

## Architecture & Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Dockyard Web (Next.js App Router)                          │
│  wagmi/viem · wallet modal · near-black UI                  │
└───────────────┬───────────────────┬─────────────────────────┘
                │                   │
        ship/dock/quote        GET /intel (browser)
                │                   │
                ▼                   ▼
┌───────────────────────┐   ┌─────────────────────────────────┐
│ Aqua + SwapVM (EVM)   │   │ Strategy Intel API (Node)       │
│ AquaRouter            │   │ 1. Query The Graph Studio       │
│ AquaSwapVMRouter      │   │ 2. Score fee/volume → params    │
│ @1inch/aqua-sdk       │   │ 3. Gate with x402 (402→pay→200) │
│ @1inch/swap-vm-sdk    │   │ Hedera testnet + Blocky402      │
└───────────────────────┘   └─────────────────────────────────┘
                │
                ▼
        Local Anvil fork demo (taker fill scripts)
```

### Stack (pin versions at scaffold time; prefer latest stable)

| Layer | Choice |
|---|---|
| App | Next.js 15 (App Router) + TypeScript + Tailwind |
| Chain client | viem + wagmi v2 |
| Wallet | RainbowKit or ConnectKit |
| Aqua | Official `@1inch/aqua-sdk` + `@1inch/swap-vm-sdk`; contracts at documented addresses |
| Indexing | GraphQL to Subgraph Studio — Messari Standardized DEX subgraphs (compose ≥2 protocol deployments or one standardized schema spanning protocols) |
| Intel API | Node.js (Next route handlers OK) or separate Fastify service |
| Payments | x402 client + Blocky402 facilitator on Hedera testnet |
| Tooling | pnpm, Foundry/Anvil for fork fills, Vitest for unit tests |
| Hosting | Vercel (web) + same for API routes; document Hedera env |

### Contract addresses (from 1inch Aqua docs — all 13 EVM chains)

| Contract | Address |
|---|---|
| Aqua registry (`AquaRouter`) | `0x1111113ccf1426a8e30e2bff5e005d929bf6a90a` |
| `AquaSwapVMRouter` v1.0.2 | `0x111111338c5091e8440b67b168bae16a668ac0de` |

Use official docs for chain matrix / Foundry setup. Do **not** redeploy Aqua registry. Path B = compose opcodes on production SwapVM; Path C custom opcode = stretch only.

### Lifecycle verbs (must appear in UI copy / README)
`ship()` · `dock()` · `pull()` · `push()` · `swap()` / `quote()`

Strategy hash = `keccak256(abi.encode(strategy))` — immutable params; change = dock + ship new.


---

## Data Model

### Client (ephemeral / localStorage OK for MVP)

```ts
type DeskSession = {
  chainId: number;
  maker: `0x${string}`;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  allowanceOk: boolean;
};

type ShipDraft = {
  programKind: "XYCConcentrate" | "XYC";
  feeBps: number;
  tickLower?: number;
  tickUpper?: number;
  notional: string;
  suggestedBy: "manual" | "graph" | "x402";
  suggestionMeta?: FeeIntelPayload;
};

type StrategyRow = {
  strategyHash: `0x${string}`;
  status: "shipped" | "docked";
  virtualBalances: Record<string, string>;
  shippedAt: number;
};
```

### Strategy Intel API

```ts
type FeeIntelRequest = {
  base: string;
  quote: string;
  lookbackHours: number; // default 24
};

type FeeIntelPayload = {
  asOf: string; // ISO
  sources: { protocol: string; subgraph: string; feeUsd24h: number; volumeUsd24h: number }[];
  recommendation: {
    programKind: "XYCConcentrate" | "XYC";
    feeBps: number;
    tickLower?: number;
    tickUpper?: number;
    rationale: string;
  };
  graphQueryIds: string[];
};
```

### Persistence
MVP: no user DB. Optional SQLite/Redis only if needed for x402 receipt cache. Do not build accounts/auth.


---

## API / Program Spec

### A. Aqua maker path (browser → EVM)

1. `connectWallet()`
2. `ensureAllowance(token, AquaRouter, amount)`
3. Build SwapVM Program via SDK (XYCConcentrate preferred)
4. Encode Program → Order → Strategy bytes
5. Call `ship(strategy, virtualBalances…)` per SDK
6. Listen / poll `Shipped` event; display `strategyHash`
7. Demo fill: Foundry script as taker calling `swap()` / `quote()` on fork (document resolver credential limitation on production)
8. `dock(strategyHash)` control in UI for clean teardown

### B. Graph FeeMirror (load-bearing)

- Endpoint (server): `POST /api/intel/preview` for ungated iteration; demo path must use x402.
- Query live Subgraph Studio with API key from env `GRAPH_API_KEY`.
- Qualification: compose standardized products — e.g. one Messari DEX schema query across Uniswap V3 + another AMM deployment, OR Subgraph MCP + standardized subgraphs. README must show standards leverage ("one query pattern → N protocols").
- Map aggregates → `ShipDraft` fields. UI button **"Apply to ship form"**.

### C. Hedera x402 Strategy Intel (load-bearing)

- `GET` or `POST /api/intel` returns **HTTP 402** with payment requirements when unpaid.
- Client (UI button **"Pay & refresh intel"** and/or small agent script `scripts/agent-buy-intel.ts`) completes payment via Blocky402 on **Hedera testnet**.
- On settlement, return `FeeIntelPayload` (same shape as preview).
- README diagrams: request → 402 → partial sign → facilitator → 200 + intel → ship form.
- Extra credit (optional): HTS token settlement, HCS audit log of receipt — only after core paid path works.

### D. Env vars

```
NEXT_PUBLIC_WALLETCONNECT_ID=
NEXT_PUBLIC_CHAIN_ID=
GRAPH_API_KEY=
GRAPH_SUBGRAPH_URLS=
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=
HEDERA_OPERATOR_KEY=
X402_FACILITATOR_URL=
INTEL_PRICE_HBAR=
```


---

## UX Flow

### Visual system (codegen — mandatory)
- Near-black background (`#0a0a0a` / `#111`), one accent (amber `#f5a524` OR electric mint `#3dffb5` — pick **one**, not both).
- Typography: serif for display titles (Newsreader / Source Serif), mono for addresses, hashes, params (JetBrains Mono / IBM Plex Mono).
- No purple SaaS gradients, no glassmorphism chrome, no Inter-everywhere blandness.
- Dense trading-desk layout: left nav (Desk / Intel / Positions), center ship form, right FeeMirror panel.
- Motion: minimal; status toasts for ship / 402 / fill.

### Critical path screens
1. Landing — one sentence + "Open desk".
2. Desk — wallet, pair, program kind, params, Ship / Dock.
3. FeeMirror panel — live Graph table + Apply.
4. Pay intel — x402 status stepper (402 → paying → settled → applied).
5. Positions — strategyHash list + virtual balances + SLR blurb.
6. Demo mode banner — "Fork fill" instructions when `NEXT_PUBLIC_DEMO_FORK=1`.

### Copy rules
- Say "strategy" in technical surfaces (matches Aqua SDK); "position" OK in maker-facing labels with tooltip "Aqua strategy".
- Never claim custody, yield guarantees, or risk-free.
- Honest risk line under Ship: IL, underfunded strategies stop filling, approval risk.

---

## Success Metrics

### Hackathon (definition of done)
- [ ] Official Aqua/SwapVM contracts used; SwapVM program shipped from UI
- [ ] Fork (or live) token transfer fill shown in demo video
- [ ] Graph: live standardized/composable query; params write into ship form; no mocks
- [ ] Hedera: ≥1 real x402 paid intel request via Blocky402
- [ ] Public repo + multi-commit history + README bounty map
- [ ] Demo video ≤5 min (2–4 preferred)
- [ ] Submitted before Sun Sep 13 2026 12:00pm EDT

### Startup (post-event hypotheses — not fake KPIs)
- 10 maker conversations in week 1 post-submit
- ≥3 makers ship a live (non-fork) strategy within 30 days
- ≥1 paying x402 consumer (human or agent) beyond demo wallet

---

## Launch & First-Customer Plan

1. Pull top makers from Aqua leaderboard API
2–5. DM Loom of fork demo (one concentrated strategy + fee attribution)
6–7. 1inch Discord #builders
8–9. ETHOnline teammate / mentor intros
10. One DAO treasury ops person (public Discord)

Pricing hypothesis (labeled): Free ship UI during hackathon; Strategy Intel metered via Hedera x402 post-event.

---

## Risks

| Risk | Mitigation |
|---|---|
| Scope explosion across 3 bounties | Freeze: one strategy type + one composed Graph query path + one x402 endpoint |
| Hedera feels bolted on | Intel must drive ship params; demo shows Apply after pay |
| Graph DQ (just one subgraph) | Standardized schema / multi-protocol composition; document leverage |
| Production takers resolver-gated | Fork fills in demo; say so on-camera |
| Solo time | Path B only; custom opcode stretch; cut multi-strategy dashboard first |
| Approval UX footgun | Default exact allowance; unlimited behind confirm |
| Startup after prizes | Retention + paid intel; else prize-only |


---

## Build Roadmap (time-scoped)

Assume start Sat Sep 5 evening → submit Sun Sep 13 12:00pm EDT (= 9:30pm IST). ~8 calendar days.

| Window | Focus | Exit criteria |
|---|---|---|
| Day 0–1 (Sat–Sun) | Scaffold Next.js + wagmi; Anvil fork; Aqua getting-started; ship XYC or XYCConcentrate via script | Scripted ship + strategyHash on fork |
| Day 2 (Mon) | Desk UI: connect, approve, ship/dock form wired to SDK | UI ships one strategy |
| Day 3 (Tue) | Graph FeeMirror: live standardized queries → recommendation → Apply | Params auto-fill from live Graph |
| Day 4 (Wed) | Hedera x402 intel API + Blocky402; UI pay path | One paid request returns intel |
| Day 5 (Thu) | Fork taker fill scripts; polish desk; SLR/risk copy; commit hygiene check | End-to-end dry run |
| Day 6 (Fri) | Demo video; README bounty map; fix judge-path bugs | Backup Loom recorded |
| Day 7 (Sat) | Buffer / stretch only if MVP green | No new legs |
| Day 8 AM (Sun) | Final submit checklist | ETHGlobal submission in |

Hard cut: if Day 4 night x402 not green, simplify intel host but do not drop payment; if Graph composition blocked, use Messari standardized single-schema multi-protocol query and document — never mocks.


---

## Build Instructions for Codegen Agent

Imperative. Follow exactly.
1. Create monorepo or single Next.js app named `dockyard` with TypeScript, Tailwind, pnpm.
2. Implement the visual system above (near-black, one accent, serif display + mono data). No purple SaaS UH kits.
3. Integrate wagmi/viem + wallet modal. Target one chain id for MVP; configure Anvil fork scripts in `/forge` or `/scripts/fork`.
4. Install and use official `@1inch/aqua-sdk` and `@1inch/swap-vm-sdk`. Call official AquaRouter + AquaSwapVMRouter addresses. Build one SwapVM program (XYCConcentrate preferred). Wire `ship` and `dock` from the Desk page.
5. Build FeeMirror panel that calls server route using `GRAPH_API_KEY` against standardized DEX subgraphs. Output must map into ship form fields via **Apply to ship form**. Prove composition/standards in README with query snippets.
6. Implement Strategy Intel as x402-gated route on Hedera testnet via Blocky402. UI must complete a paid request; add `scripts/agent-buy-intel.ts` that does the same for the Hedera agentic-payments story.
7. Add Foundry/Anvil demo of token transfer fill; document production resolver gate honestly.
8. Write README sections: Architecture, Bounty map (Hedera / Graph / 1inch), Env, Demo script, Judging notes.
9. Commit early and often with meaningful messages (`feat(desk): ship XYCConcentrate`, `feat(graph): standardized fee panel`, `feat(x402): hedera intel gate`, …).
10. Record ≤5 min demo: Desk → Apply Graph → Ship → Fork fill → Pay intel → Apply again.
11. Do not implement verify, games, vaults, ATS, ENS, or Chainlink.
12. If blocked on SDK types, read 1inch Aqua portal docs (Getting Started + SwapVM instructions) and match their examples — do not invent opcode semantics.

### Repo layout (suggested)

```
dockyard/
  app/
  components/desk/
  components/intel/
  lib/aqua/
  lib/graph/
  lib/x402/
  scripts/
  forge/
  README.md
  agent.md
```

---

## References

- Validator packet: `/workspace/ideation/ethonline2026-validator-packet.md`
- https://ethglobal.com/events/ethonline2026/prizes/hedera
- https://ethglobal.com/events/ethonline2026/prizes/the-graph
- https://ethglobal.com/events/ethonline2026/prizes/1inch
- https://business.1inch.com/portal/documentation/aqua/overview
- https://1inch.com/blog/post/1inch-aqua-launch
- https://1inch.com/blog/post/500-mln-in-swaps
- https://hedera.com/blog/hedera-and-the-x402-payment-standard/
- Showcase anti-patterns: AgentVault, Alps, ZENITH, FluxSettle

---

## Spec freeze acknowledgement

Matches COS PASS constraints:
- Product Dockyard (Shipwright-class Aqua maker desk)
- Partners: Hedera x402 intel only (not ATS); Graph Standardized/composable preferred; 1inch Aqua App + SwapVM
- MVP: one SwapVM strategy · Graph panel writes ship params · ≥1 live x402 paid call · fork fills OK · ≤5min demo · multi-commit history
- Custom opcode = stretch
- Forbids: no verify/KYC/games
- Deadline: Sun Sep 13 2026 12:00pm EDT From Scratch
