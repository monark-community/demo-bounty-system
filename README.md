# TaskFlow by Monark

TaskFlow is Monark's bounty module: a bounty board where every reward is **locked in escrow before anyone starts** and **released the moment the work is approved**, either by the poster or by a vote of named validators. Contributors earn reputation from approved work only, and posters can reserve tasks for members or ambassadors.

This repository is the **demo site**: a marketing page plus a working, fully simulated product (testnet tokens, simulated wallet and chain, no backend). Project page: https://www.monark.io/en/project/bounty-system

> Demo · simulated data. Testnet demo · not financial advice · no real funds.

## What you can do in the demo

1. **Connect a demo wallet** (a simulated sign-in; reject it to see the failure).
2. **Post a bounty**: describe it, lock the reward in escrow, choose who can submit and who decides.
3. **Submit work** to an open bounty, then play the poster's side to see an approval (you get paid) or a rejection with a written reason.
4. **Review submissions** on your own bounty: approve and pay, or reject with a reason; cancel and refund when nothing is waiting.
5. **Vote as a validator** on a 2-of-3 bounty: when the quorum approves, the payout runs in the same transaction.

Every transaction goes through a wallet prompt, a pending state with a hash, then confirmation or failure. **Demo controls** (the "Sepolia testnet" pill in the app bar) slow the network, make the next transaction fail, give you the ambassador role, or **reset the demo**.

## Run it locally

Requirements: Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Checks and production build:

```bash
pnpm lint
pnpm typecheck
pnpm build && pnpm start
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL (default `https://taskflow.monark.io`).

Screenshots of every page and flow (Playwright, against a running production server):

```bash
pnpm build && pnpm start -p 3137
pnpm screenshots http://localhost:3137   # writes docs/screenshots/
```

## How the simulation works

Everything lives in `src/lib/demo/`, behind a small typed layer that mirrors the contract, so it could be replaced by wagmi/viem calls without touching the UI:

| File | Role |
|-|-|
| `types.ts` | `Bounty`, `Submission`, `Vote`, `ReviewMode`, wallet and transaction types. Amounts are base-unit strings. |
| `seed.ts` | The example community (people, nine bounties in every state), created in the visitor's language with dates relative to "now". |
| `store.ts` | A tiny external store persisted to `localStorage` (every access in try/catch), plus the wallet-prompt promise. |
| `chain.ts` | `useTx()`: prompt, then pending with a hash for a realistic block time (1.2–2.4 s, or 3–6 s on a slow network), then confirmed or reverted. |
| `ops.ts` | State transitions, one per contract call: `postBounty`, `submitWork`, `approveSubmission`, `rejectSubmission`, `castVote`, `cancelBounty`. |
| `select.ts` | Pure reads: who can submit, reputation and leaderboard, board summary, what's waiting on you. |
| `wallet.ts` | Simulated connection through a sign-in message. |

## Project structure

```
src/
  app/[locale]/             Locale routes (en, fr): home, how-it-works, credits, pricing (unlinked), 404
  app/[locale]/app/         The demo: board, bounty/[id], new, you, leaderboard
  components/bounty/        Ticket, escrow rail, vote tally, bounty page, dialogs
  components/demo/          App frame, board, composer, your work, leaderboard, wallet prompt, demo controls
  components/home/          Hero lifecycle ticket
  components/diagrams/      Escrow and quorum line art
  components/site/          Standard Monark header, footer, locale switch, theme
  components/ui/            shadcn/ui components from the Monark UI registry
  i18n/                     Typed EN and FR dictionaries
  lib/demo/                 Simulated chain, wallet and data layer
  proxy.ts                  Redirects / to the visitor's language
docs/
  site-plan.md              The plan this site was built from (kept in sync)
  assets.md                 Every image and its licence
  screenshots/              Playwright screenshots
```

Stack: Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4, shadcn/ui on the [Monark UI registry](https://ui.monark.io), `lucide-react`, `next-themes`, `sonner`.

## Deploy to Vercel

Import the repository in Vercel and keep the defaults (framework Next.js, `pnpm install`, `pnpm build`). No `vercel.json` or environment variables are required; every page prerenders. The Node version comes from `engines` in `package.json`.

## Licence and credits

Open source, by the Monark community. Photos from Unsplash (see `docs/assets.md` and `/credits`).
