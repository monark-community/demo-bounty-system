# TaskFlow by Monark: site plan

Status: plan for the rebuild on `develop`. It is kept in sync with what ships.

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
- **Subheadline:** *TaskFlow is Monark's bounty board. The reward sits in escrow from day one, contributors submit their work, and the moment it's approved, the payout lands in their wallet.*
  FR: *TaskFlow est le tableau de primes de Monark. La récompense est bloquée en séquestre dès le premier jour, les contributeurs soumettent leur travail, et dès qu'il est approuvé, le paiement arrive dans leur portefeuille.*
- **Primary CTA:** "Open the bounty board" / « Ouvrir le tableau des primes » → `/{locale}/app`.
- **Secondary CTA:** "See how it works" / « Voir le fonctionnement » → `/{locale}/how-it-works`.
- **Visual:** a **live bounty ticket** built in code (JSX + SVG): a real-looking bounty ("Translate the Governance docs into French · 300 tUSDC") whose lifecycle rail steps through *Reward locked → Submission received → Approved → Paid* on a calm loop. The reward chip sits inside an escrow bracket while locked, then an orange line draws from the escrow to the contributor's avatar and the amount lands in their wallet, with "+25 reputation" ticking up. Product UI over a photo because the ticket *is* the promise (money locked, then released on approval); photos appear lower down to show who uses it. The mesh butterfly sits large and cropped behind it (see §8).

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`). `/` and any locale-less path redirect to the visitor's preferred language (fallback English) through `src/proxy.ts`.

| Route | Purpose | Sections, in order |
|-|-|-|
| `/{locale}` | Home: explain the idea in 30 seconds and send people into the board. | Hero with live bounty ticket · Three outcomes · A bounty's life in four steps (line-art rail) · Open right now (three real bounty cards from the demo data) · Who posts on TaskFlow (three photo cards) · FAQ · Closing call to action |
| `/{locale}/app` | The bounty board: browse and filter. | Connect gate (when disconnected: board still readable, actions ask to connect) · Summary strip (open bounties, locked in escrow, paid out, your reputation) · Filters (search, status, category, "I can submit") · Bounty list · Demo controls |
| `/{locale}/app/bounty/[id]` | One bounty: brief, escrow, submissions, decision. | Header (title, poster, status, visibility, category, difficulty) · Escrow panel (amount, contract address, lock tx, deadline countdown) · Brief and acceptance criteria · Your action (submit work, or why you can't) · Submissions (per review mode: approve / reject with note, or validator tally and vote) · Activity (every event with tx hash) |
| `/{locale}/app/new` | Post a bounty and lock its reward. | Templates · Task (title, description, acceptance criteria) · Category, difficulty, skills · Reward and token (with wallet balance) · Deadline · Who can submit · Who decides (you, or validators with quorum) · Live preview card · Lock reward and publish |
| `/{locale}/app/you` | Your work in one place. | Reputation card · Waiting on you (submissions to review, votes to cast) · Your submissions (with status and rejection notes) · Bounties you posted |
| `/{locale}/app/leaderboard` | Contributor leaderboard and reputation. | Top contributors (rank, reputation, approved bounties, earned) · Your position · How points are earned |
| `/{locale}/how-it-works` | For students, developers and careful posters: the mechanics. Justified because the documentation frames TaskFlow as a teaching project ("smart contract security, reward logic, role assignment… validator rotation"), and validator voting, refunds and reputation need more than a home-page line. | Intro · Escrow: where the reward lives (diagram) · Two ways to decide (poster review vs validator vote, quorum diagram) · Rejections and refunds · Visibility by role · Reputation · For developers (contract interface and how the demo's data layer mirrors it) · Call to action |
| `/{locale}/credits` | Photo, font and icon credits (required by the asset rules). | Photos · Type and icons · Monark brand assets |
| `/{locale}/pricing` | **Internal strategy review only.** Never linked, excluded from the sitemap, `noindex, nofollow`. | "Free, part of Monark" · What it costs (gas only, 0% fee on rewards) · Partner deployments · Reasoning |
| 404 | Friendly not-found with the vertical Monark logo and links home and to the board. | |

Why `/app/you` and `/app/leaderboard` are separate routes rather than tabs: both are documented features (reputation, leaderboard), both are linked from bounty pages and toasts ("+25 reputation, see the leaderboard"), and deep links make the flows screenshot- and share-friendly.

**Header** (standard Monark shell): "TaskFlow by Monark" pairing → home · links: *Overview*, *How it works*, *Bounty board* (pill highlight on the active one) · EN/FR switch · theme toggle · primary pill *Open the board*. Inside `/app` the primary action becomes the `connect-wallet` component and a "Demo · simulated data" badge appears. Mobile: pairing + menu button opening a full-height sheet.

**App sub-navigation** (inside `/app`): *Board* · *Your work* (with a count of things waiting on you) · *Leaderboard* · primary pill *Post a bounty*.

**Footer** (three bands): product line + links (Overview, How it works, Bounty board, Credits) · Monark logo + tagline, links to the project page on monark.io and the GitHub repo, social icons · "© {year} Monark · Open source", "Demo · simulated data", photo credits link.

## 5. Feature highlights

| Feature | User benefit | Where it appears | Proven by flow |
|-|-|-|-|
| Reward locked in escrow | Contributors start knowing they will be paid | Hero ticket; home steps; composer; bounty escrow panel | Flow 2 |
| Pay on approval | Payout is instant and automatic; nobody chases anyone | Hero ticket; bounty page submissions | Flows 3, 4 |
| Rejection notes | A "no" always comes with a reason you can act on | Bounty page; Your work | Flows 3, 4 |
| Validator vote (quorum) | Sensitive or high-value work is decided by several people | Home FAQ; `/how-it-works`; bounty page tally | Flow 5 |
| Visibility by role | Programmes (ambassadors, members) can reserve work for their people | Board filter "I can submit"; bounty page; composer | Flow 3 (locked variant) |
| Reputation and leaderboard | Good work builds a public track record | Hero (+points); `/app/you`; `/app/leaderboard` | Flows 3, 4, 5 |

## 6. Key flows

Every transaction goes through a simulated wallet prompt ("Confirm in your wallet": what happens, amount, estimated network fee, the testnet disclaimer, *Confirm* / *Reject*), then a **pending** state with a transaction hash (1.2–2.4 s; 3–6 s with "slow network" on), then **confirmed** or **failed**. Demo controls let a visitor make the next transaction fail on-chain; rejecting in the wallet prompt always produces the "rejected" failure, and nothing changes.

1. **Connect a wallet.** On `/app` (board readable) → any action or "Connect demo wallet" → wallet prompt "Sign in to TaskFlow" (a signature, no fee) → *pending* "Waiting for signature…" → *connected*: header chip (Jazzicon + `0x5c21…a7E4`), summary shows "Your reputation". *Failed*: "You declined the sign-in request. Nothing was shared." with *Try again*.
2. **Post a bounty and lock the reward.** *Post a bounty* → template or blank → title, description, acceptance criteria (one per line), category, difficulty → reward (amount + token, shows wallet balance; "You only have 1,240 tUSDC" error above balance) → deadline (at least tomorrow) → who can submit → who decides (you, or validators with 2 of 3) → live preview card → *Lock 600 tUSDC and publish* → wallet prompt → *pending* "Locking the reward in escrow…" (the reward chip slides into the escrow bracket) → *confirmed*: redirect to the new bounty, escrow panel shows the locked amount, contract address and lock tx; toast "Bounty published. 600 tUSDC is locked in escrow." *Failed*: "The transaction failed on the simulated network. Your tokens never left your wallet." with *Try again*; the form stays filled.
3. **Submit work, and hear back.** Open bounty → *Submit your work* → link (validated URL), note (20–600 characters), confirm "My work meets the acceptance criteria" → wallet prompt "Record your submission" → *pending* → *confirmed*: your submission appears "Waiting for review" with a timestamp and hash. In the demo the other side is simulated: *Simulate the poster's decision → Approve* or *→ Reject* (in demo controls on the submission) → approval: escrow releases to your wallet, your balance and reputation tick up, bounty shows *Paid*; rejection: the note appears ("The French glossary is missing; please add the term list from section 3."), you may resubmit before the deadline. **Blocked variants:** deadline passed ("Submissions closed on {date}"), visibility ("Only ambassadors can submit. Everyone can read it."), already submitted, poster can't submit to their own bounty. *Failed*: "Your submission wasn't recorded. Nothing was sent; try again."
4. **Review submissions on your bounty.** *Your work → Waiting on you* or your bounty ("Write integration tests for the Trust Contacts API", 2 submissions) → compare submissions (link, note, time) → **Approve** → wallet prompt "Release 600 tUSDC to Priya Raman" → *pending* → *confirmed*: the escrow line draws to the contributor, "Paid" stamp, other submissions become "Not selected", reputation +50 shown on the contributor. Or **Reject** → note required (10+ characters) → wallet prompt → *pending* → *confirmed*: submission shows "Rejected" with the note. **Cancel and refund** is available while no submission is waiting (e.g. after rejecting both) → prompt → escrow returns to your wallet. *Failed*: "The payout failed. The reward is still safely in escrow; nobody was paid." with *Retry*.
5. **Vote as a validator.** "Audit the escrow release function" (2,000 tUSDC, validator vote, 2 of 3) → submission by Kwame Mensah has 1 of 3 approvals (Aïcha Diallo) → you vote *Approve* or *Reject* (reason optional for approve, required for reject) → wallet prompt → *pending* → *confirmed*: your dot fills, the tally settles to 2 of 3, the quorum marker locks and the payout executes in the same transaction (escrow line, "Paid"). A reject vote leaves it at 1 approve / 1 reject, waiting for the third validator (*Simulate Marc-Antoine's vote*). *Failed*: "Your vote wasn't counted. Try again."

## 7. Content (EN / FR)

The shipped copy lives in `src/i18n/dictionaries/en.ts` and `fr.ts` (typed; French must satisfy the English shape). Draft copy for the main sections:

### Home

| Slot | English | Français |
|-|-|-|
| Eyebrow | Bounty module · Monark | Module de primes · Monark |
| H1 | Post the task. Lock the reward. Pay on approval. | Publiez la tâche. Bloquez la récompense. Payez à l'approbation. |
| Sub | TaskFlow is Monark's bounty board. The reward sits in escrow from day one, contributors submit their work, and the moment it's approved, the payout lands in their wallet. | TaskFlow est le tableau de primes de Monark. La récompense est bloquée en séquestre dès le premier jour, les contributeurs soumettent leur travail, et dès qu'il est approuvé, le paiement arrive dans leur portefeuille. |
| CTAs | Open the bounty board · See how it works | Ouvrir le tableau des primes · Voir le fonctionnement |
| Outcomes H2 | Work gets done. People get paid. Nobody chases anyone. | Le travail avance. Les gens sont payés. Personne ne court après personne. |
| Outcome 1 | **Start knowing the money is there.** Every reward is locked in escrow before the bounty opens, and it can't be quietly withdrawn while you work. | **Commencez en sachant que l'argent est là.** Chaque récompense est bloquée en séquestre avant l'ouverture de la prime, et personne ne peut la retirer en douce pendant que vous travaillez. |
| Outcome 2 | **Paid the minute it's approved.** Approval and payout are the same transaction. No invoice, no reminder, no waiting for the treasurer. | **Payé dès l'approbation.** Approuver et payer, c'est la même transaction. Pas de facture, pas de relance, pas d'attente. |
| Outcome 3 | **Decisions you can check.** Every rejection comes with a reason, sensitive work is decided by a vote, and reputation comes only from approved work. | **Des décisions vérifiables.** Chaque refus est motivé, le travail sensible est tranché par un vote, et la réputation ne vient que du travail approuvé. |
| Steps H2 | A bounty's life, in four steps | La vie d'une prime, en quatre étapes |
| Step 1 | **Post and lock.** Describe the task and lock the reward in escrow. | **Publier et bloquer.** Décrivez la tâche et bloquez la récompense en séquestre. |
| Step 2 | **Submit.** Anyone allowed can send a link to their work before the deadline. | **Soumettre.** Toute personne autorisée envoie le lien de son travail avant l'échéance. |
| Step 3 | **Review or vote.** The poster decides, or a council of validators votes. | **Évaluer ou voter.** L'auteur tranche, ou un conseil de validateurs vote. |
| Step 4 | **Paid.** The escrow pays the contributor and their reputation grows. | **Payé.** Le séquestre paie le contributeur et sa réputation grandit. |
| Open now H2 | Open right now on the demo board | Ouvert en ce moment sur le tableau de démo |
| Who H2 | Who posts on TaskFlow | Qui publie sur TaskFlow |
| Open source | **Open-source maintainers.** Put a reward on the issue nobody has time for, and merge the fix the day it's paid. | **Mainteneurs open source.** Mettez une récompense sur le ticket que personne n'a le temps de traiter, et fusionnez le correctif le jour où il est payé. |
| Student challenges | **Student challenges.** Run a hackathon or a class challenge where the prize is locked before the first line of code. | **Défis étudiants.** Organisez un hackathon ou un défi de cours dont le prix est bloqué avant la première ligne de code. |
| Community programmes | **Ambassador programmes.** Reserve tasks for your ambassadors and let a small council approve the results. | **Programmes d'ambassadeurs.** Réservez des tâches à vos ambassadeurs et laissez un petit conseil approuver les résultats. |
| Closing | Your first bounty takes two minutes to post. / Post a bounty | Votre première prime se publie en deux minutes. / Publier une prime |

**FAQ**

1. *Is this real money?* No. This is a testnet demo with simulated data: no real funds, no real wallet, nothing leaves your browser. / *Est-ce de l'argent réel ?* Non. C'est une démo sur testnet avec des données simulées : aucun fonds réel, aucun vrai portefeuille, rien ne quitte votre navigateur.
2. *What does "locked in escrow" mean?* The reward is held by the bounty's smart contract (a program on the blockchain), not by the poster. It can only go to an approved contributor, or back to the poster if the bounty is cancelled. / *Que veut dire « bloqué en séquestre » ?* La récompense est détenue par le contrat intelligent de la prime (un programme sur la blockchain), pas par son auteur. Elle ne peut aller qu'à un contributeur approuvé, ou revenir à l'auteur si la prime est annulée.
3. *Who decides whether my work is accepted?* Either the poster, or a named group of validators who vote; the bounty says which before you start. Validator bounties pay out automatically once the quorum approves. / *Qui décide si mon travail est accepté ?* Soit l'auteur de la prime, soit un groupe de validateurs nommés qui votent ; la prime l'indique avant que vous commenciez. Les primes à validateurs paient automatiquement dès que le quorum approuve.
4. *What if my submission is rejected?* You get a written reason. If the deadline hasn't passed, you can fix it and submit again. / *Et si ma soumission est refusée ?* Vous recevez une raison écrite. Si l'échéance n'est pas passée, vous pouvez corriger et soumettre à nouveau.
5. *Can a poster take the reward back?* Only by cancelling while no submission is waiting for a decision, and the cancellation is public. Once work is under review, the money stays put. / *L'auteur peut-il reprendre la récompense ?* Seulement en annulant la prime quand aucune soumission n'attend de décision, et l'annulation est publique. Dès qu'un travail est en évaluation, l'argent reste en place.
6. *How is reputation calculated?* Only approved work counts: 10, 25, 50 or 100 points depending on difficulty. It can't be bought or transferred. / *Comment la réputation est-elle calculée ?* Seul le travail approuvé compte : 10, 25, 50 ou 100 points selon la difficulté. Elle ne s'achète pas et ne se transfère pas.
7. *Does TaskFlow take a cut?* No. The contributor receives the full reward; on a real network the only cost is the transaction fee (gas). / *TaskFlow prend-il une commission ?* Non. Le contributeur reçoit toute la récompense ; sur un vrai réseau, le seul coût est le frais de transaction (gas).

### App: key strings

| Slot | English | Français |
|-|-|-|
| Connect gate | Connect a demo wallet to submit, post or vote. Nothing is signed for real. | Connectez un portefeuille de démo pour soumettre, publier ou voter. Rien n'est signé pour de vrai. |
| Summary | Open bounties · Locked in escrow · Paid to contributors · Your reputation | Primes ouvertes · Bloqué en séquestre · Versé aux contributeurs · Votre réputation |
| Board empty (filters) | No bounty matches these filters. Clear them to see the whole board. | Aucune prime ne correspond à ces filtres. Effacez-les pour voir tout le tableau. |
| Board empty (none) | The board is empty. Post the first bounty, or reset the demo to bring back the examples. | Le tableau est vide. Publiez la première prime, ou réinitialisez la démo pour retrouver les exemples. |
| Wallet prompt | Confirm in your wallet · Estimated network fee · Confirm · Reject | Confirmez dans votre portefeuille · Frais de réseau estimés · Confirmer · Refuser |
| Disclaimer | Testnet demo · not financial advice · no real funds | Démo sur testnet · ceci n'est pas un conseil financier · aucun fonds réel |
| Pending | Waiting for the network… | En attente du réseau… |
| Locked | {amount} is locked in escrow | {amount} est bloqué en séquestre |
| Paid | Paid {amount} to {name} | {amount} versé à {name} |
| Failed payout | The payout failed. The reward is still safely in escrow; nobody was paid. | Le paiement a échoué. La récompense est toujours en séquestre ; personne n'a été payé. |
| Rejected in wallet | You rejected the request in your wallet. Nothing was sent. | Vous avez refusé la demande dans votre portefeuille. Rien n'a été envoyé. |
| Visibility lock | Only ambassadors can submit to this bounty. Everyone can read it. | Seuls les ambassadeurs peuvent soumettre à cette prime. Tout le monde peut la lire. |
| Deadline passed | Submissions closed on {date}. | Les soumissions ont fermé le {date}. |
| No submissions | No submissions yet. Be the first: the reward is already locked. | Aucune soumission pour l'instant. Soyez le premier : la récompense est déjà bloquée. |
| Nothing waiting | Nothing is waiting on you. Browse the board for something to work on. | Rien ne vous attend. Parcourez le tableau pour trouver une tâche. |
| Unknown bounty | We couldn't find this bounty. It may have disappeared when the demo was reset. | Cette prime est introuvable. Elle a peut-être disparu lors de la réinitialisation de la démo. |
| Storage error | Your browser blocked local storage, so the demo will forget changes when you leave. | Votre navigateur bloque le stockage local : la démo oubliera vos changements à la fermeture. |

The complete list (form validation, demo controls, how-it-works, credits, 404 and error copy) is in the dictionaries.

## 8. Aesthetics (within the Monark guidelines)

Colour, type, logo, header and footer are fixed by the guidelines: cream / espresso tokens derived from `#f88d10` with `--surface-tint: 1` (§3 token block pasted over `theme.json`), Nunito Sans 400/600/700/800, pill actions, 1rem cards, borders not shadows, flat orange only.

- **Layout and rhythm.** Home: hero (copy left, ticket right on desktop; stacked on mobile) → outcomes (three columns, outline icons top-left) → four-step rail (one horizontal line with four nodes on desktop, vertical on mobile) → "open right now" (three real bounty cards) → photo cards → FAQ (single column, 68ch) → closing band. The branded section divider appears twice. The app is a working tool: a dense board list (not a grid of fluffy cards) with a right rail on desktop for escrow and activity; single column on mobile with a sticky action bar on the bounty page.
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
