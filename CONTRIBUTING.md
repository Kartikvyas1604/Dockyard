# Contributing

## The shared-first rule

Before writing any logic in an app, ask: **could this live in `packages/`?** If yes, put
it there. No copy-pasting across apps, ever.

- Pure functions (formatting, validation) → `packages/utils`
- Typed API contracts + client → `packages/api`
- Cross-app React state → `packages/store`
- Reusable hooks → `packages/hooks`
- Components → `packages/ui` (tokens first — no hardcoded hex, no magic spacing)

## Shared component checklist (packages/ui)

Each component in `packages/ui/src/components/atoms/<Name>/`:

- `Name.tsx` — web implementation
- `Name.props.ts` — exported prop types (note: TS 5.9 strips `.types` extensions on
  resolution, so we use `.props`)
- `Name.native.tsx` — React Native override (resolved by Metro; exclude from web tsconfig)
- `Name.test.tsx` — Vitest + Testing Library
- `Name.stories.tsx` — Storybook CSF3
- `index.ts` — barrel re-exports

## Design rules (enforced)

1. Colors from tokens (`bg-surface`, `text-accent`) — the ESLint config blocks raw hex.
2. Real `<button>` / `<a>` — never `<div onClick>`.
3. Visible focus rings on every interactive element.
4. Loading (skeleton), empty, and error states exist for anything that fetches or lists.
5. Animations respect `prefers-reduced-motion`; transition specific properties, never `all`.
6. Forms have visible labels, correct `type`/`inputmode`, inline errors with `aria-describedby`.

## Commits

Conventional, small, meaningful: `feat(desk): ship XYCConcentrate form`,
`feat(graph): standardized fee panel`. Never squash the history into one dump.
