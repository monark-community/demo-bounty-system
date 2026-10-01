# Simplification pass

Owner feedback: *"Simplify, reduce text quantity, revise flows so that context is only given when necessary. Two top bars on homepage is too busy; demo banners only on demo/app pages."*

Binding rules: `monark-brand-guidelines.md` §8 "Restraint", §10 and §11. Method: the TaskFlow pass follows the checklist in the TrustRate pilot (`sites/address-review-system/docs/simplification.md` §4). TaskFlow is Monark-branded and was built before the standard header existed, so the pass also brings the header and footer up to §2 and §10.

How the numbers are measured (both scripts are in `scripts/`, run against `pnpm start -p 3137`):

- `node scripts/wordcount.mjs`: words per page, English, at 1440px. *Visible* is the `innerText` of `<main>`. *Total* also counts closed disclosures and FAQ answers. *Chrome* is everything outside `<main>` (header and footer). On `/app` pages the app bar is inside `<main>`. The bounty pages, the board, your work and the leaderboard also contain seeded data (bounty briefs, submission notes, names).
- `node scripts/dictcount.mjs`: words of copy in `src/i18n/dictionaries/{en,fr}.ts`, per section.

## 1. Before

| Page | Visible in main | Total in main (incl. collapsed) | Chrome (header, footer) |
|-|-:|-:|-:|
| Home | 526 | 696 | 74 |
| How it works | 673 | 652 | 74 |
| Credits | 129 | 129 | 74 |
| 404 | 32 | 32 | 74 |
| App: board (guest) | 260 | 263 | 77 |
| App: board (connected) | 242 | 245 | 77 |
| App: bounty (open, submit) | 214 | 222 | 77 |
| App: bounty (review yours) | 344 | 368 | 77 |
| App: bounty (validator vote) | 331 | 350 | 77 |
| App: post a bounty | 221 | 224 | 77 |
| App: your work | 135 | 138 | 77 |
| App: leaderboard | 157 | 160 | 77 |
| **Total** | **3,264** | **3,479** | **912** |

Dictionary copy: **EN 4,074 words** (meta 169 · common 144 · labels 53 · home 692 · how 562 · credits 95 · pricing 178 · seed 680 · app 1,500); **FR 4,480**.

What was on screen:

- **Shell.** The header used the old "TaskFlow · by Monark" pairing, links pushed right, and a dashed "Demo · simulated data" badge that only appeared inside `/app`. The footer had no "built by Monark" line and repeated the testnet line in its legal band.
- **App chrome.** Two bars under the header: a strip (network badge, the testnet notice, Demo controls) and the section nav (Board, Your work, Leaderboard, Post a bounty).
- **Home.** Hero with an eyebrow and a 33-word subline, plus the testnet line under the buttons; then six sections: outcomes (heading, intro paragraph, 3 items of ~20 words), four steps (eyebrow + 15-word step lines), open right now (eyebrow + paragraph + 3 tickets), who posts (eyebrow + 3 photo cards with 17-word lines and example chips), a 7-question FAQ, and a closing band with a body line and two buttons. Two section dividers. The outcomes restated the steps.
- **How it works.** Eyebrow + 30-word intro; long escrow body and three 15-word points; 30-word cards per review mode; 25-word rejection items; visibility and reputation paragraphs; a 50-word developer paragraph with the contract interface, file map and notes always open; CTA with a body line.
- **Testnet line** (not financial advice): in the app strip on every app page, under every Approve and Vote button, in the composer, in the cancel dialog, in the footer and on the home hero, as well as in the wallet prompt.
- **Flows.** Intro paragraphs above the board, composer, your work and leaderboard; a 22-word connect card; step hints on every composer field; a 20-word submit dialog description and field hints; an always-visible escrow explanation; a "Demo: play the other side" explanation; transaction hashes on every submission and history line; a toast for every result, although the card, the tally or the escrow panel already showed it; two-sentence empty and error states.

## 2. What changed

No feature or flow was removed.

### Shell (header and footer to the §10 standard)

- **Header**, from Splitflow's reference components (`brand.tsx`, `demo-chip.tsx`, `header.tsx`, `nav-links.tsx`, `mobile-menu.tsx`, `theme.tsx`): butterfly mark 28px + "TaskFlow" in Nunito Sans 800 18px on one line, no "by Monark"; links left after the brand (muted, active in foreground); right side Demo chip (primary 8% light / 15% dark, primary-ink) → EN/FR pill → 36px theme toggle → primary action ("Open the board", or the connect-wallet control inside `/app`). Below `lg`, brand + menu button; the sheet holds the links, the Demo chip, EN/FR, theme and the action. Removed `pairing.tsx` and `app-demo-badge.tsx`.
- **Footer**: the Monark band opens with "TaskFlow is built by Monark" / « TaskFlow est conçu par Monark »; the legal band keeps "Demo · simulated data" and drops the testnet line; product line 16 → 10 words.
- **Marketing pages**: one top bar (the header). The testnet line under the hero buttons is gone.

### Home (hero + 6 sections → hero + 5)

- Hero: removed the eyebrow and the testnet line; subline 33 → 15 words; secondary button "See how it works" → "How it works".
- **Removed "outcomes"**: it restated the four steps (lock / paid / decisions). The steps lost their eyebrow and their lines went from 12–17 to 6–9 words.
- Open right now: heading, 3 tickets and "See the whole board"; removed eyebrow and paragraph.
- Who posts: heading "Who posts on TaskFlow" (was eyebrow + 9-word heading); card lines 15–17 → 7–9 words; removed the example chips.
- FAQ: 7 → 5 questions, answers of 20–40 → 10–12 words. "What does locked in escrow mean" is answered by the steps and `/how-it-works`; "How is reputation calculated" is the table on `/how-it-works` and the leaderboard info icon.
- Closing: heading + one button (removed the body line and the second button). One section divider instead of two.

### How it works

- No eyebrow; intro 30 → 9 words. Escrow body 52 → 19 words, points 13–16 → 6–8 words. Review-mode cards 20–28 → 11–12 words; rejection items 20–25 → 5–8 words; visibility and reputation one line each, visibility cards are titles only.
- For developers: 50 → 14-word line; the contract interface, the data-layer file map and the notes sit behind "Show the contract interface".
- CTA: heading + button. One divider instead of two.

### App (`/app/...`)

- **One bar instead of two.** The strip is gone. The section nav, one pill "● Sepolia testnet ⚙" that opens Demo controls, and "Post a bounty" share one compact bar. On phones the pill and "Post a bounty" are icons, so the three sections fit at 390px in English and French.
- **Testnet line once per transaction**, in the wallet prompt only. Removed from under Approve and Vote, the composer and the cancel dialog.
- Board: removed the intro paragraph; summary 4 → 3 stats (dropped "Paid to contributors"; the USD note is the tooltip of "Locked in escrow"); the connect card is one line + button; the list shows 4 bounties + "Show more bounties"; empty states are one line + the next action.
- Bounty page: removed "Back to the board" (the Board tab is active in the app bar) and the posting date (it is in History); the "Locked in escrow" line above the rail only appears once the money moves (released or refunded); the escrow "why" is an info popover next to "Escrow"; submission and history hashes moved into the tooltip of their date; Your move no longer repeats "this is your bounty" or "submissions closed" to posters and validators; "Reputation on approval" → "Reputation"; the "play the other side" explanation is gone (the dashed "Demo:" box says it).
- Submit dialog: the description is screen-reader only; removed the link hint (the placeholder shows `https://`); the note hint is the constraint only ("20 to 600 characters").
- Reject dialog: description 20 → 8 words; hint "At least 10 characters."
- Composer: removed the intro, the deadline hint, the preview hint and the "your form is still filled in" line; hints are constraints only ("8 to 90 characters.", "One per line, up to 8.", "Earns +25 pts."); review options 12–14 → 4–8 words.
- Your work: removed the intro and the "See the leaderboard" link (Leaderboard is in the app bar); empty states one line + action.
- Leaderboard: removed the intro; the points table moved from a side panel into an info popover next to the title.
- Demo controls: hints 8–13 → 3–5 words; reset confirmation 14 → 6 words.
- **One message, once.** Removed the toasts for connecting (the header chip shows it), publishing (the page opens on the locked escrow), submitting (the submission appears), approving, rejecting, voting, reaching the quorum and cancelling (the card, tally or escrow panel shows each). The remaining toasts are "You were paid {amount}. +{points} reputation." (new information) and "Demo reset."
- Wallet-prompt failure messages: 12 → 8 words.
- New shared component: `src/components/ui/info-tip.tsx` (from the pilot: a Radix popover behind an info icon, opens on click or tap).

### Other pages

- 404: removed the eyebrow; body 17 → 7 words.
- Credits: removed the intro and the "Used on the home page" line per photo; type and brand lines shortened.

French was rewritten to the same brevity (`src/i18n/dictionaries/fr.ts`), and keys no longer used were removed from both locales.

## 3. After

| Page | Visible before | Visible after | Change | Total before | Total after | Chrome before | Chrome after |
|-|-:|-:|-:|-:|-:|-:|-:|
| Home | 526 | 261 | −50% | 696 | 319 | 74 | 65 |
| How it works | 673 | 260 | −61% | 652 | 399 | 74 | 65 |
| Credits | 129 | 68 | −47% | 129 | 68 | 74 | 65 |
| 404 | 32 | 19 | −41% | 32 | 19 | 74 | 65 |
| App: board (guest) | 260 | 148 | −43% | 263 | 151 | 77 | 65 |
| App: board (connected) | 242 | 144 | −40% | 245 | 147 | 77 | 65 |
| App: bounty (open, submit) | 214 | 162 | −24% | 222 | 170 | 77 | 65 |
| App: bounty (review yours) | 344 | 266 | −23% | 368 | 280 | 77 | 65 |
| App: bounty (validator vote) | 331 | 265 | −20% | 350 | 276 | 77 | 65 |
| App: post a bounty | 221 | 137 | −38% | 224 | 137 | 77 | 65 |
| App: your work | 135 | 107 | −21% | 138 | 110 | 77 | 65 |
| App: leaderboard | 157 | 101 | −36% | 160 | 104 | 77 | 65 |
| **Total** | **3,264** | **1,938** | **−41%** | **3,479** | **2,180** | **912** | **780** |

Marketing pages alone (home, how it works, credits, 404): 1,360 → 608 visible words (−55%). What remains on the bounty pages is mostly the bounty itself (brief, criteria, submission notes, history).

Dictionary copy: **EN 4,074 → 2,901 words (−29%)**, **FR 4,480 → 3,200 (−29%)**. Per section (EN): meta 169 → 159 · common 144 → 127 · labels 53 → 51 · home 692 → 323 · how 562 → 309 · credits 95 → 52 · app 1,500 → 1,021 · seed 680 and pricing 178 unchanged (demo data and the internal, unlinked page).

### Screenshots

- Before: `docs/screenshots/before/en-1440-light-page-home.png`, `docs/screenshots/before/en-1440-light-flow4-review.png`.
- After: `docs/screenshots/en-1440-light-page-home.png`, `docs/screenshots/en-1440-light-flow4-review.png`, and every page and flow step in `docs/screenshots/` (EN 390/1440 light and dark, FR 390/1440 light for home, board and flow 4).
