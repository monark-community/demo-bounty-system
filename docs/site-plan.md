# TaskFlow by Monark: site plan

Status: shipped on `develop`. This plan describes what the site does; it is kept in sync with the code (see §12 for decisions taken while building). A simplification pass (less text, context on demand, one top bar, the standard header) is recorded in `docs/simplification.md`.

- Product: **TaskFlow**, Monark's bounty module.
- Authoritative description: https://www.monark.io/en/project/bounty-system
- Branding: **Monark-branded** (`true`). `lovable-migration/monark-brand-guidelines.md` is binding.
- Stack: Next.js (latest stable, App Router, `src/`, TypeScript strict), pnpm, Tailwind CSS v4, shadcn/ui on the Monark UI registry, `lucide-react`.

Research read for this plan: the Lovable source on `main` (`src/pages/*`, `src/components/*`), the project page on monark.io (source: `monark-community/website/content/{en,fr}/project/bounty-system/page.mdx`), the "`monark-branded` column" section of `repos-and-websites.md`, and the brand guidelines. The live Lovable site is a client-rendered copy of the `main` source.

---

## 1. Product brief

**What the documentation says.** TaskFlow is "a trustless bounty management platform for DAOs, open-source projects, and Web3 communities". Organisations publish tasks with a token reward and a deadline; contributors submit work; **the poster (admin) or voters validate the result**; once a submission is approved, the smart contract pays the contributor's wallet automatically. It supports categories, deadlines, approval flows, **rejection notes**, a contributor **leaderboard**, **reputation scores** and optional **role-based task visibility**. Students should be able to explore reward logic, role assignment and DAO workflows such as **multi-sig approvals / validator voting**.

**Target users.**

- **Posters:** a maintainer of a Monark module (for example the Trust Contacts API), a student association running a challenge, the ambassador programme lead. They want work done without paying by hand, chasing invoices or being accused of favouritism.
- **Contributors:** students, developers, designers and ambassadors in the Monark community. They want to know the money is real before they start, to be paid the moment their work is accepted, and to get credit that follows them.
- **Validators:** members of a small council (for example the security council) who vote on high-value or sensitive work so no single person decides.
- **Learners:** students reading how an escrowed bounty contract works (Monark's education mission).

**Core job to be done.** *"When our community needs a piece of work done, put a reward on it that everyone can see is real, let anyone qualified take a shot, and pay the person whose work is accepted, without one person holding the money or the final word."*

**Domain concepts** (each explained in plain words the first time the site uses it):

| Concept | Meaning in TaskFlow |
|-|-|
| Bounty | A task with a title, description, acceptance criteria, category, difficulty, deadline and a token reward. |
| Escrow | The reward is locked in the bounty's smart contract when it is posted. Nobody can spend it except by approving a submission (paid to the contributor) or cancelling (refunded to the poster). |
| Submission | A contributor's answer: a link to the work (pull request, file, video) and a short note. Recorded on-chain with a timestamp, so "who submitted first" is never in doubt. |
| Review mode | Who decides. **Poster review**: the poster approves or rejects. **Validator vote**: a named council votes, and the payout executes when a quorum (e.g. 2 of 3) approves. |
| Rejection note | A rejection always carries a short written reason, visible to the contributor. |
| Visibility | Who can submit: **Everyone**, **Monark members**, or **Ambassadors only**. Everyone can read every bounty; the restriction applies to submitting. |
| Reputation | Points earned only from approved work (10, 25, 50 or 100 depending on difficulty). They feed the leaderboard and cannot be bought. |
| Refund | A poster can cancel a bounty that has no submission waiting for a decision; the escrow goes back to them. |
| AI agent | A contributor that is software. Registered by a named **operator** (a person) who owns its wallet and answers for its work. Payouts go to the agent's wallet, credited to the operator; its reputation counts for both. |
| Agent policy | Set per bounty by the poster: **Humans only** (default), **Agents welcome**, or **Agents only**. Whatever the policy, agents never approve, reject or vote, and an operator never decides on their own agent's work. |

**What the Lovable version got wrong or left out.**

- A generic purple-to-blue gradient landing page with frosted cards and "Built for the future of decentralized work" copy. Nothing Monark, nothing specific to how Monark hands out work.
- **No escrow**: posting a bounty was a form that showed a toast; the reward was never locked or shown as locked, which is the whole trust promise.
- **No review**: nobody could approve, reject or vote. "Admins or voters validate the result" (the documented core) was absent, as were rejection notes and multi-sig/validator approval.
- The submission form accepted anything and led nowhere; submissions never appeared on the bounty.
- Leaderboard and profile were static tables; reputation never changed. Role-based visibility did not exist.
- Hard-coded 2024 deadlines, English only, no disclaimers, no pending/failed states, nothing persisted, a "🚧" banner over the content.

## 2. Value proposition

**TaskFlow gives Monark communities a bounty board where every reward is locked in escrow before anyone starts and released the moment the work is approved, so contributors know they will be paid and maintainers never pay, chase or argue by hand.**

Supporting benefits, as outcomes:

1. **Start work knowing the money is there.** Every reward is visibly locked before the bounty opens; nobody can quietly withdraw it while you work.
2. **Get paid the minute your work is accepted.** Approval and payout are the same transaction: no invoice, no reminder, no waiting for the treasurer.
3. **Decisions you can check.** Every rejection comes with a reason, sensitive work is decided by a vote, and your reputation is earned from approved work only.

## 3. Hero

- **Headline** (8 words): *Post the task. Lock the reward. Pay on approval.*
  FR: *Publiez la tâche. Bloquez la récompense. Payez à l'approbation.*
- **Subheadline:** *The reward sits in escrow until the work is approved, then pays out at once.*
  FR: *La récompense reste en séquestre jusqu'à l'approbation du travail, puis part aussitôt.*
- **Primary CTA:** "Open the bounty board" / « Ouvrir le tableau des primes » → `/{locale}/app`.
- **Secondary CTA:** "How it works" / « Fonctionnement » → `/{locale}/how-it-works`.
- **Visual:** a **live bounty ticket** built in code (JSX + SVG): a real-looking bounty ("Translate the Governance docs into French · 300 tUSDC") whose lifecycle rail steps through *Reward locked → Submission received → Approved → Paid* on a calm loop. The reward chip sits inside an escrow bracket while locked, then an orange line draws from the escrow to the contributor's avatar and the amount lands in their wallet, with "+25 reputation" ticking up. Product UI over a photo because the ticket *is* the promise (money locked, then released on approval); photos appear lower down to show who uses it. The mesh butterfly sits large and cropped behind it (see §8).

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`). `/` and any locale-less path redirect to the visitor's preferred language (fallback English) through `src/proxy.ts`.

| Route | Purpose | Sections, in order |
|-|-|-|
| `/{locale}` | Home: explain the idea in 30 seconds and send people into the board. | Hero with live bounty ticket (no eyebrow, no disclaimer) · A bounty's life in four steps (line-art rail; replaces the former "three outcomes", which restated it) · Open right now (three real bounty cards from the demo data) · Agents can take bounties, people still decide (three guardrails + an agent's submission waiting for review, drawn in code; links to `/how-it-works#agents-title`) · Who posts on TaskFlow (three photo cards) · FAQ (5 questions) · Closing call to action (heading + button) |
| `/{locale}/app` | The bounty board: browse and filter. | Title (no intro) · Summary (open bounties, locked in escrow, your reputation) · Connect card when disconnected (one line + button; board still readable) · Filters (search, status, category, "I can submit") · Bounty list, 4 at a time + "Show more bounties" |
| `/{locale}/app/bounty/[id]` | One bounty: brief, escrow, submissions, decision. | Header (status, poster, title) · Escrow panel (rail with the locked amount, contract address, lock tx; "why" behind an info icon) · Brief and acceptance criteria · Your move (submit work, or one line on why you can't) · Submissions (per review mode: approve / reject with note, or validator tally and vote; hashes in tooltips) · Details · History (hash in each date's tooltip) |
| `/{locale}/app/new` | Post a bounty and lock its reward. | Title (no intro) · Templates · Task (title, description, acceptance criteria) · Category, difficulty, skills · Reward and token (with wallet balance) · Deadline · Who can submit · Who decides (you, or validators with quorum) · Live preview card · Lock reward and publish (hints are the constraints only) |
| `/{locale}/app/you` | Your work in one place. | Reputation card · Waiting on you (submissions to review, votes to cast) · Your submissions (with status and rejection notes) · Bounties you posted |
| `/{locale}/app/leaderboard` | Contributor leaderboard and reputation. | Top contributors (rank, reputation, approved bounties, earned) · Your position · Points per difficulty behind an info icon next to the title |
| `/{locale}/how-it-works` | For students, developers and careful posters: the mechanics. Justified because the documentation frames TaskFlow as a teaching project ("smart contract security, reward logic, role assignment… validator rotation"), and validator voting, refunds and reputation need more than a home-page line. | One-line intro · Escrow: where the reward lives (diagram) · Two ways to decide (poster review vs validator vote, quorum diagram) · Rejections and refunds · Visibility by role · Reputation · AI agents (the three policies and the accountability rules) · For developers (one line; contract interface, data-layer map and notes behind "Show the contract interface") · Call to action (heading + button) |
| `/{locale}/credits` | Photo, font and icon credits (required by the asset rules). | Photos · Type and icons · Monark brand assets |
| `/{locale}/pricing` | **Internal strategy review only.** Never linked, excluded from the sitemap, `noindex, nofollow`. | "Free, part of Monark" · What it costs (gas only, 0% fee on rewards) · Partner deployments · Reasoning |
| 404 | Friendly not-found with the vertical Monark logo and links home and to the board. | |

Why `/app/you` and `/app/leaderboard` are separate routes rather than tabs: both are documented features (reputation, leaderboard), both are linked from bounty pages and toasts ("+25 reputation, see the leaderboard"), and deep links make the flows screenshot- and share-friendly.

**Header** (standard Monark shell, guidelines §2 and §10, one bar on every marketing page): butterfly mark 28px + "TaskFlow" (Nunito Sans 800, 18px), no "by Monark" · links left after the brand: *Overview*, *How it works*, *Bounty board* (muted, active in foreground) · right: Demo chip (primary 8% light / 15% dark, primary-ink) → EN/FR pill → 36px theme toggle → primary *Open the board*. Inside `/app` the primary action becomes the `connect-wallet` component. Below `lg`: brand + menu button; the sheet holds the links, Demo chip, EN/FR, theme and the action.

**App bar** (inside `/app`, the only bar under the header): *Board* · *Your work* (with a count of things waiting on you) · *Leaderboard* on the left; on the right one pill "● Sepolia testnet ⚙" that opens Demo controls (icon-only on phones) and *Post a bounty* (icon-only on phones, hidden on the composer). No testnet strip.

**Footer** (three bands): product line (10 words) + links (Overview, How it works, Bounty board, Credits) · "TaskFlow is built by Monark" / « TaskFlow est conçu par Monark », Monark logo + tagline, links to the project page on monark.io and the GitHub repo, social icons · "© {year} Monark · Open source", "Demo · simulated data", photo credits link (the testnet line is not in the footer).

## 5. Feature highlights

| Feature | User benefit | Where it appears | Proven by flow |
|-|-|-|-|
| Reward locked in escrow | Contributors start knowing they will be paid | Hero ticket; home steps; composer; bounty escrow panel | Flow 2 |
| Pay on approval | Payout is instant and automatic; nobody chases anyone | Hero ticket; bounty page submissions | Flows 3, 4 |
| Rejection notes | A "no" always comes with a reason you can act on | Bounty page; Your work | Flows 3, 4 |
| Validator vote (quorum) | Sensitive or high-value work is decided by several people | Home steps and FAQ; `/how-it-works`; bounty page tally | Flow 5 |
| Visibility by role | Programmes (ambassadors, members) can reserve work for their people | Board filter "I can submit"; bounty page; composer | Flow 3 (locked variant) |
| Reputation and leaderboard | Good work builds a public track record | Hero (+points); `/app/you`; `/app/leaderboard` | Flows 3, 4, 5 |
| Agentic work | Agents take the chores; a person still decides and answers for them | Home agents section; `/how-it-works` AI agents; board filter and ticket chip; composer; bounty page; leaderboard | Flow 6 |

## 6. Key flows

Every transaction goes through a simulated wallet prompt ("Confirm in your wallet": what happens, amount, estimated network fee, the testnet disclaimer (its only place on the site, once per transaction), *Confirm* / *Reject*), then a **pending** state with a transaction hash (1.2–2.4 s; 3–6 s with "slow network" on), then **confirmed** or **failed**. Demo controls let a visitor make the next transaction fail on-chain; rejecting in the wallet prompt always produces the "rejected" failure, and nothing changes.

1. **Connect a wallet.** On `/app` (board readable) → any action or "Connect demo wallet" → wallet prompt "Sign in to TaskFlow" (a signature, no fee) → *pending* "Waiting for signature…" → *connected*: header chip (Jazzicon + `0x5c21…a7E4`), summary shows "Your reputation" (no toast). *Failed*: "You declined the sign-in. Nothing was shared." with *Try again*.
2. **Post a bounty and lock the reward.** *Post a bounty* → template or blank → title, description, acceptance criteria (one per line), category, difficulty → reward (amount + token, shows wallet balance; "You only have 1,240 tUSDC" error above balance) → deadline (at least tomorrow) → who can submit → who decides (you, or validators with 2 of 3) → live preview card → *Lock 600 tUSDC and publish* → wallet prompt → *pending* "Locking the reward in escrow…" (the reward chip slides into the escrow bracket) → *confirmed*: redirect to the new bounty, escrow panel shows the locked amount, contract address and lock tx (no toast: the page is the confirmation). *Failed*: "The transaction failed on the simulated network. Your tokens never left your wallet." with *Try again*; the form stays filled.
3. **Submit work, and hear back.** Open bounty → *Submit your work* → link (validated URL), note (20–600 characters), confirm "My work meets the acceptance criteria" → wallet prompt "Record your submission" → *pending* → *confirmed*: your submission appears "Waiting for review" with a timestamp and hash. In the demo the other side is simulated: *Simulate the poster's decision → Approve* or *→ Reject* (in demo controls on the submission) → approval: escrow releases to your wallet, your balance and reputation tick up, bounty shows *Paid*; rejection: the note appears ("The French glossary is missing; please add the term list from section 3."), you may resubmit before the deadline. **Blocked variants:** deadline passed ("Submissions closed on {date}"), visibility ("Only ambassadors can submit. Everyone can read it."), already submitted, poster can't submit to their own bounty. *Failed*: "Your submission wasn't recorded. Nothing was sent; try again."
4. **Review submissions on your bounty.** *Your work → Waiting on you* or your bounty ("Write integration tests for the Trust Contacts API", 2 submissions) → compare submissions (link, note, time) → **Approve** → wallet prompt "Release 600 tUSDC to Priya Raman" → *pending* → *confirmed*: the escrow line draws to the contributor, "Paid" stamp, other submissions become "Not selected", reputation +50 shown on the contributor. Or **Reject** → note required (10+ characters) → wallet prompt → *pending* → *confirmed*: submission shows "Rejected" with the note. **Cancel and refund** is available while no submission is waiting (e.g. after rejecting both) → prompt → escrow returns to your wallet. *Failed*: "The payout failed. The reward is still safely in escrow; nobody was paid." with *Retry*.
5. **Vote as a validator.** "Audit the escrow release function" (2,000 tUSDC, validator vote, 2 of 3) → submission by Kwame Mensah has 1 of 3 approvals (Aïcha Diallo) → you vote *Approve* or *Reject* (reason optional for approve, required for reject) → wallet prompt → *pending* → *confirmed*: your dot fills, the tally settles to 2 of 3, the quorum marker locks and the payout executes in the same transaction (escrow line, "Paid"). A reject vote leaves it at 1 approve / 1 reject, waiting for the third validator (*Simulate Marc-Antoine's vote*). *Failed*: "Your vote wasn't counted. Try again."

6. **Review an agent's submission.** Your bounty "Write integration tests for the Trust Contacts API" (Agents welcome) has a third submission from **Relay**, an agent with an *Agent* badge and "Run by Sofía Álvarez". A note on the card says the poster reviews it like any other submission and agents can't approve. **Approve and pay** → wallet prompt "Release 600 tUSDC to Relay", *Paid to: Relay, agent of Sofía Álvarez* → *confirmed*: the escrow rail pays Relay (caption "Run by Sofía Álvarez"), Relay gains +50 reputation and so does Sofía ("incl. 170 from agents" on the leaderboard). **Agents only:** "Label and deduplicate the open issues in the docs repo" was won by Glossa (run by Théo Marchand) and approved by Marc-Antoine Roy; as a person you see "Only AI agents can submit to this bounty." **Posting:** the composer's "AI agents" choice (Humans only / Agents welcome / Agents only, with "Agents never decide" when agents are allowed). **Board:** "Open to AI agents" filter; tickets show an *Agents welcome* / *Agents only* chip. **Leaderboard:** Everyone / People / Agents filter; agents show their operator, operators show the agents they run.

## 7. Content (EN / FR)

The shipped copy lives in `src/i18n/dictionaries/en.ts` and `fr.ts` (typed; French must satisfy the English shape). The tables below are the copy after the simplification pass; the dictionaries are the source of truth.

### Home

| Slot | English | Français |
|-|-|-|
| H1 | Post the task. Lock the reward. Pay on approval. | Publiez la tâche. Bloquez la récompense. Payez à l'approbation. |
| Sub | The reward sits in escrow until the work is approved, then pays out at once. | La récompense reste en séquestre jusqu'à l'approbation du travail, puis part aussitôt. |
| CTAs | Open the bounty board · How it works | Ouvrir le tableau des primes · Fonctionnement |
| Steps H2 | A bounty's life, in four steps | La vie d'une prime, en quatre étapes |
| Step 1 | **Post and lock.** Describe the task and lock the reward in escrow. | **Publier et bloquer.** Décrivez la tâche et bloquez la récompense en séquestre. |
| Step 2 | **Submit.** Anyone allowed sends a link before the deadline. | **Soumettre.** Les personnes autorisées envoient un lien avant l'échéance. |
| Step 3 | **Review or vote.** The poster decides, or validators vote. | **Évaluer ou voter.** L'auteur tranche, ou des validateurs votent. |
| Step 4 | **Paid.** The escrow pays out and reputation grows. | **Payé.** Le séquestre paie et la réputation grandit. |
| Open now H2 | Open right now | Ouvert en ce moment |
| Who H2 | Who posts on TaskFlow | Qui publie sur TaskFlow |
| Open source | **Open-source maintainers.** Put a reward on the issue nobody has time for. | **Mainteneurs open source.** Récompensez le ticket que personne n'a le temps de traiter. |
| Student challenges | **Student challenges.** Lock the prize before the first line of code. | **Défis étudiants.** Bloquez le prix avant la première ligne de code. |
| Community programmes | **Ambassador programmes.** Reserve tasks for ambassadors; a small council approves. | **Programmes d'ambassadeurs.** Des tâches réservées aux ambassadeurs, approuvées par un petit conseil. |
| Closing | Post your first bounty in two minutes. / Post a bounty | Publiez votre première prime en deux minutes. / Publier une prime |

**FAQ** (the only FAQ on the site; mechanics such as reputation points live on `/how-it-works`)

1. *Is this real money?* No. It's a testnet demo: nothing leaves your browser. / *Est-ce de l'argent réel ?* Non. C'est une démo sur testnet : rien ne quitte votre navigateur.
2. *Who decides whether my work is accepted?* The poster, or a named group of validators. The bounty says which. / *Qui décide si mon travail est accepté ?* L'auteur, ou un groupe de validateurs nommés. La prime l'indique.
3. *What if my submission is rejected?* You get a written reason and can resubmit before the deadline. / *Et si ma soumission est refusée ?* Vous recevez une raison écrite et pouvez soumettre à nouveau avant l'échéance.
4. *Can a poster take the reward back?* Only by cancelling while no submission awaits a decision, in public. / *L'auteur peut-il reprendre la récompense ?* Seulement en annulant, en public, quand aucune soumission n'attend de décision.
5. *Does TaskFlow take a cut?* No. Contributors get the full reward; the only cost is gas. / *TaskFlow prend-il une commission ?* Non. Le contributeur reçoit toute la récompense ; seul le gas coûte.
6. *Can AI agents take bounties?* Yes, where the poster allows it. A person always reviews the work, and the agent's operator answers for it. / *Des agents IA peuvent-ils relever des primes ?* Oui, si l'auteur le permet. Une personne évalue toujours le travail, et l'opérateur de l'agent en répond.

### App: key strings

| Slot | English | Français |
|-|-|-|
| Connect card | Connect a demo wallet to submit, post or vote | Connectez un portefeuille de démo pour soumettre, publier ou voter |
| Summary | Open bounties · Locked in escrow · Your reputation | Primes ouvertes · Bloqué en séquestre · Votre réputation |
| Board empty (filters) | No bounty matches these filters. + *Clear filters* | Aucune prime ne correspond à ces filtres. + *Effacer les filtres* |
| Board empty (none) | The board is empty. + *Post a bounty* | Le tableau est vide. + *Publier une prime* |
| Wallet prompt | Confirm in your wallet · Estimated network fee · Confirm · Reject | Confirmez dans votre portefeuille · Frais de réseau estimés · Confirmer · Refuser |
| Disclaimer (wallet prompt only) | Testnet demo · not financial advice · no real funds | Démo sur testnet · ceci n'est pas un conseil financier · aucun fonds réel |
| Pending | Waiting for the network… | En attente du réseau… |
| Escrow info (popover) | Only an approval can pay it out. Only a cancellation can refund it. | Seule une approbation peut le verser. Seule une annulation peut le rembourser. |
| Rejected in wallet | You rejected it in your wallet. Nothing was sent. | Refusée dans votre portefeuille. Rien n'a été envoyé. |
| Visibility lock | Only ambassadors can submit. | Seuls les ambassadeurs peuvent soumettre. |
| Deadline passed | Submissions closed on {date}. | Les soumissions ont fermé le {date}. |
| No submissions | No submissions yet. | Aucune soumission pour l'instant. |
| Nothing waiting | Nothing is waiting on you. + *Board* | Rien ne vous attend. + *Tableau* |
| Unknown bounty | This bounty doesn't exist. The demo may have been reset. + *Back to the board* | Cette prime n'existe pas. La démo a peut-être été réinitialisée. + *Retour au tableau* |
| Storage error | Your browser blocks storage: changes won't be kept. | Votre navigateur bloque le stockage : rien ne sera gardé. |

The complete list (form validation, demo controls, how-it-works, credits, 404 and error copy) is in the dictionaries.

## 8. Aesthetics (within the Monark guidelines)

Colour, type, logo, header and footer are fixed by the guidelines: cream / espresso tokens derived from `#f88d10` with `--surface-tint: 1` (§3 token block pasted over `theme.json`), Nunito Sans 400/600/700/800, pill actions, 1rem cards, borders not shadows, flat orange only.

- **Layout and rhythm.** Home: hero (copy left, ticket right on desktop; stacked on mobile) → four-step rail (one horizontal line with four nodes on desktop, vertical on mobile) → "open right now" (three real bounty cards) → photo cards → FAQ (single column, 68ch) → closing band. The branded section divider appears once. The app is a working tool: a dense board list (not a grid of fluffy cards) with a right rail on desktop for escrow and activity; single column on mobile with a sticky action bar on the bounty page.
- **The bounty card as a ticket.** Bounties read as tickets: reward on the right edge with a small lock icon and a perforated divider (a dashed vertical border) separating task from reward. This single motif ties the hero, board, preview and home cards together.
- **Hero visual.** The live bounty ticket (see §3).
- **Mesh butterfly.** Once, on the home hero, large and cropped off the right edge at low opacity behind the ticket; flat orange lines. Nowhere else.
- **Illustrations.** No reused Monark decorative illustrations beyond the mesh butterfly. New flat orange line art drawn in JSX/SVG: the four-step rail (home), the escrow diagram (poster → escrow → contributor or refund) and the quorum diagram (three validator nodes feeding a 2-of-3 gate) on `/how-it-works`. No gradients or glows.
- **Photography direction.** Warm, natural-light photos of real people working on code together: a developer at a laptop in warm light, a student competition floor, students sharing a desk. Same warm grade, sitting well on cream and espresso. Used only in "Who posts on TaskFlow", always paired with a line of copy.
- **Signature moments.**
  1. **The lock.** When a bounty is published, the reward chip slides into the escrow bracket and the bracket closes with a small lock; the escrow panel shows the amount and lock hash.
  2. **Verdict and release.** Approving stamps the submission "Approved", an orange line draws from the escrow to the contributor, and the reward counts up in their row with "+50 reputation".
  3. **The tally settling.** On validator bounties, each validator is a node; votes fill them in, the bar settles, and on reaching the quorum the gate marker locks and the payout fires in the same step.
- Motion 150–250 ms ease-out for state changes; the hero loop and the release line are slower and explanatory. Everything honours `prefers-reduced-motion` (final states render directly).

## 9. Assets

| Asset | Purpose | Placement |
|-|-|-|
| `public/images/maintainer.jpg` (Unsplash, Anthony Riera) | Open-source maintainer use case | Home "Who posts on TaskFlow" |
| `public/images/challenge.jpg` (Unsplash, algoleague) | Student challenge / hackathon use case | Home "Who posts on TaskFlow" |
| `public/images/ambassadors.jpg` (Unsplash, Raka Rahmadani) | Community / ambassador programme use case | Home "Who posts on TaskFlow" |
| `public/brand/*` Monark logos (standalone, horizontal light/dark, vertical light/dark) | Header pairing, footer, 404, favicon | Shell |
| `public/brand/monark-mesh.svg` | Home hero decoration | Home hero only |
| `public/brand/socials/*.svg` | Footer social icons | Footer |
| Open Graph image | Generated with `next/og` per locale | Metadata |

Icons: Lucide only. Diagrams: built in JSX/SVG. Full credits in `docs/assets.md` and on `/credits`.

## 10. Pricing strategy

TaskFlow is **free, included in the Monark bundle**. Reasons: it is how Monark itself hands out work to its community (the FAQ names the Bounty module as a core module); a cut taken from contributors' rewards would work against the promise "you receive the full reward"; and it is open source. Contributors get 100% of the reward (0% protocol fee); the only cost on a real network is gas, paid by whoever sends the transaction. Partners that need a supported deployment (their own chain, onboarding, a reviewed contract) go through Monark's partnership programme, not a price list.

A designed `/{locale}/pricing` page exists **for internal review only**: not linked anywhere, excluded from `sitemap.xml`, `robots: { index: false, follow: false }`. No other page mentions prices.

## 11. Out of scope

- Real wallets, chains, signing or tokens (no wagmi/viem; `src/lib/demo/` is shaped so it could be swapped in).
- Splitting one reward among several winners, or paying in stages (that is MilestoneMint's job); one bounty has one winner.
- Disputes and appeals beyond the rejection note and resubmission; validator rotation (explained on `/how-it-works`, not simulated).
- Editing a bounty after it is published (only cancel and refund), comments or chat, notifications, file uploads (submissions are links), profiles for other people.
- A `/brand` page, a blog, or any backend.

## 12. Implementation notes (as shipped)

Decisions taken unattended while building, recorded here instead of asked:

- **Source for the documentation page.** monark.io renders the project page client-side, so it was read from its source (`monark-community/website/content/en/project/bounty-system/page.mdx`). Its feature list (categories, deadlines, approval flows, rejection notes, leaderboard, reputation, role-based visibility, multi-sig/validator approvals) drives §5 and §6.
- **Theme.** `theme-2026.json` isn't published, so `theme.json` was installed and the guidelines' §3 token block pasted over it in `src/app/globals.css`, plus muted `--success` / `--warning` status colours (always paired with a text label). `--surface-tint: 1`.
- **Registry.** `wallet`, `token-amount`, `network-badge` and `tx-status` came from the `@monark` registry; `connect-wallet`'s bare `wallet` dependency doesn't resolve through the shadcn CLI, so its source was copied from the registry JSON. Registry components are restyled to pills, as in the other Monark demo sites.
- **Board without a gate.** Unlike a dashboard, a bounty board is public: every page of `/app` is readable without a wallet, and actions show an inline "Connect a demo wallet" card instead of a full-page gate.
- **Your roles in the demo.** You are a Monark member, a validator on the security council (for the audit bounty) and the poster of one bounty; you are not an ambassador, so the ambassador-only bounty demonstrates the visibility lock. A demo control grants the ambassador role.
- **Playing the other side.** The poster's and other validators' decisions are simulated by clearly labelled "Demo: play the other side" buttons on your own submission (and "Simulate Marc-Antoine's vote" after you vote), so flows 3 and 5 can be completed alone. These skip the wallet prompt (it isn't your wallet) but still go through pending and confirmation.
- **Ticket stub label.** The stub says "Locked" / « Bloqué » (not "Locked in escrow") so it fits on one line at 360 px; the escrow panel on the bounty page spells it out.
- **Home "Open right now".** The three cards are rendered at build time from the same seed as the demo, without deadlines (a relative deadline would be stale in a static page).
- **Language switch.** Seeded content is re-translated when the visitor switches language, keeping every change they made; text they typed stays as typed.
- **Toasts.** One message, once: the only toasts left are "You were paid {amount}. +{points} reputation." (the reputation is new information) and "Demo reset." Every other result is shown by the card, the tally, the escrow panel or the page the flow lands on. Toasts sit top-right under the header on desktop and full width under the header on phones.
- **Context on demand.** `src/components/ui/info-tip.tsx` (a Radix popover behind an info icon, works on touch) holds the escrow "why" on the bounty page and the points table on the leaderboard; the contract interface on `/how-it-works` is behind a disclosure.
- **Dependencies beyond the stack.** `next-themes` (theme toggle without a flash), `sonner` (toasts), `react-jazzicon` (required by the registry `wallet`), `cn` (the registry's class merger); `playwright` as a dev dependency for `pnpm screenshots`. No recharts: the only chart-like elements are the tally and leaderboard bars, drawn in code.
- **Agentic work.** Added after the first review. Agents are `Person` records with an `operatorId`; bounties carry `agents: "humans" | "welcome" | "only"`. `canDecide()` in `select.ts` stops agents, the contributor and the agent's operator from approving or voting (`ops.ts` enforces it). Operator reputation includes their agents' (shown as "incl. N from agents" from `sm` up); payouts and the "Approved" and "Earned" columns stay with the agent. The visitor is a person, so agents-only bounties show the "agents" block reason. The demo state moved to `version: 2`; saves from version 1 are dropped and the demo reseeds. Advisory agent checks for reviewers are described on `/how-it-works` but not simulated. No claim of on-chain verification of work: approval is human.
- **Screenshots.** `docs/screenshots/`: every page and flow at 390 and 1440 px, light and dark, in English; the home page, the board and the review-and-payout flow (flow 4) in French, at both widths.
