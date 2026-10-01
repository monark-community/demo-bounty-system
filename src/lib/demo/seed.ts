import type { Dictionary } from "@/i18n"

import { seededAddress, seededHash } from "./ids"
import { units } from "./tokens"
import type { Bounty, BountyEvent, DemoState, Person, ReviewMode, Submission, Vote } from "./types"

export type SeedCopy = Dictionary["seed"]

/** The visitor's own person id and demo wallet address. */
export const YOU_ID = "you"
export const YOU_ADDRESS = "0x5c21e9A4d07B3f8c61a2E0b94D7f3C18e6b2a7E4"

/** The Monark Security Council: the validators offered in the composer. */
export const COUNCIL = ["aicha", "marc", "ines"]

/** Seeded bounty ids (prerendered detail pages). */
export const SEED_BOUNTY_IDS = [
  "translate-governance-guide",
  "timesheet-timezone",
  "audit-escrow-release",
  "trust-contacts-tests",
  "hackathon-poster",
  "ambassador-walkthrough",
  "docs-dark-theme",
  "quebec-study-night",
  "payout-gas-costs",
] as const

const DAY = 86_400_000

function person(
  id: string,
  name: string,
  handle: string,
  roles: Person["roles"],
  baseReputation: number,
  baseCompleted: number,
  baseEarnedUsdc: number
): Person {
  return {
    id,
    name,
    handle,
    address: id === YOU_ID ? YOU_ADDRESS : seededAddress(`person:${id}`),
    roles,
    baseReputation,
    baseCompleted,
    baseEarned: units(baseEarnedUsdc, "tUSDC"),
  }
}

/**
 * The example community, in the visitor's language. Dates are relative to the
 * moment the demo is seeded, so deadlines always look plausible.
 */
export function createSeed(copy: SeedCopy, locale: "en" | "fr"): DemoState {
  const now = Date.now()
  const at = (days: number, hours = 0) => new Date(now + days * DAY + hours * 3_600_000).toISOString()
  const endOfDay = (days: number) => {
    const d = new Date(now + days * DAY)
    d.setHours(23, 59, 0, 0)
    return d.toISOString()
  }
  const b = copy.bounties
  const s = copy.submissions
  const o = copy.orgs

  const people: Person[] = [
    person(YOU_ID, copy.you, "@you", ["member"], 35, 2, 400),
    person("ines", "Inès Belkacem", "@ines.b", ["member"], 410, 14, 5200),
    person("priya", "Priya Raman", "@priyar", ["member"], 385, 12, 4750),
    person("kwame", "Kwame Mensah", "@kwame.sec", ["member"], 520, 9, 11800),
    person("lea", "Léa Tremblay", "@lea.qc", ["member", "ambassador"], 240, 11, 2150),
    person("theo", "Théo Marchand", "@theo.m", ["member"], 95, 5, 780),
    person("aicha", "Aïcha Diallo", "@aicha.d", ["member"], 460, 13, 8300),
    person("marc", "Marc-Antoine Roy", "@marcantoine", ["member"], 300, 8, 6100),
    person("mei", "Mei Chen", "@meichen", ["member"], 180, 7, 1900),
    person("daniel", "Daniel Okafor", "@dokafor", ["member", "ambassador"], 150, 6, 1300),
    person("hugo", "Hugo Lefebvre", "@hugo.lef", ["member"], 60, 3, 450),
    person("sofia", "Sofía Álvarez", "@sofia.alv", ["member"], 205, 8, 2300),
  ]

  const poster: ReviewMode = { kind: "poster" }
  const council = (quorum: number, validators = COUNCIL): ReviewMode => ({ kind: "validators", validators, quorum })

  function sub(bountyId: string, personId: string, link: string, note: string, daysAgo: number, extra: Partial<Submission> = {}): Submission {
    return {
      id: `${bountyId}:${personId}`,
      personId,
      link,
      note,
      at: at(-daysAgo),
      hash: seededHash(`submit:${bountyId}:${personId}`),
      status: "review",
      votes: [],
      ...extra,
    }
  }

  function events(bounty: Omit<Bounty, "events">, extra: BountyEvent[] = []): BountyEvent[] {
    const list: BountyEvent[] = [
      { id: `${bounty.id}:posted`, at: bounty.createdAt, kind: "posted", personId: bounty.posterId, amount: bounty.reward, hash: bounty.lockHash },
      ...bounty.submissions.map<BountyEvent>((x) => ({
        id: `${x.id}:submitted`,
        at: x.at,
        kind: "submitted",
        personId: x.personId,
        hash: x.hash,
        submissionId: x.id,
      })),
      ...bounty.submissions.flatMap((x) =>
        x.votes.map<BountyEvent>((v) => ({
          id: `${x.id}:vote:${v.personId}`,
          at: v.at,
          kind: "vote",
          personId: v.personId,
          approve: v.approve,
          hash: v.hash,
          submissionId: x.id,
        }))
      ),
      ...extra,
    ]
    return list.sort((a, c) => a.at.localeCompare(c.at))
  }

  function bounty(
    id: string,
    fields: Omit<Bounty, "id" | "escrowAddress" | "lockHash" | "events" | "status" | "submissions"> &
      Partial<Pick<Bounty, "status" | "submissions" | "winnerSubmissionId">>,
    extraEvents: BountyEvent[] = []
  ): Bounty {
    const base: Omit<Bounty, "events"> = {
      id,
      escrowAddress: seededAddress(`escrow:${id}`),
      lockHash: seededHash(`lock:${id}`),
      status: "open",
      submissions: [],
      ...fields,
    }
    return { ...base, events: events(base, extraEvents) }
  }

  const aichaVote: Vote = { personId: "aicha", approve: true, note: s.aichaVote, at: at(-1, -3), hash: seededHash("vote:audit:aicha") }

  const bounties: Bounty[] = [
    bounty("translate-governance-guide", {
      ...b.translate,
      category: "documentation",
      difficulty: "intermediate",
      token: "tUSDC",
      reward: units(300, "tUSDC"),
      deadline: endOfDay(9),
      visibility: "everyone",
      review: poster,
      posterId: "ines",
      org: o.core,
      createdAt: at(-6),
      submissions: [sub("translate-governance-guide", "lea", "https://github.com/monark-community/docs/pull/214", s.lea, 1)],
    }),
    bounty("timesheet-timezone", {
      ...b.timesheet,
      category: "development",
      difficulty: "intermediate",
      token: "tUSDC",
      reward: units(450, "tUSDC"),
      deadline: endOfDay(6),
      visibility: "members",
      review: poster,
      posterId: "ines",
      org: o.core,
      createdAt: at(-3),
    }),
    bounty("audit-escrow-release", {
      ...b.audit,
      category: "security",
      difficulty: "expert",
      token: "tUSDC",
      reward: units(2000, "tUSDC"),
      deadline: endOfDay(-2),
      visibility: "members",
      review: council(2, ["aicha", "marc", YOU_ID]),
      posterId: "ines",
      org: o.council,
      createdAt: at(-16),
      submissions: [
        sub("audit-escrow-release", "kwame", "https://github.com/monark-community/taskflow-contracts/pull/31", s.kwame, 3, { votes: [aichaVote] }),
      ],
    }),
    bounty("trust-contacts-tests", {
      ...b.tests,
      category: "development",
      difficulty: "advanced",
      token: "tUSDC",
      reward: units(600, "tUSDC"),
      deadline: endOfDay(4),
      visibility: "everyone",
      review: poster,
      posterId: YOU_ID,
      org: o.core,
      createdAt: at(-8),
      submissions: [
        sub("trust-contacts-tests", "priya", "https://github.com/monark-community/trust-contacts/pull/88", s.priya, 2),
        sub("trust-contacts-tests", "mei", "https://github.com/monark-community/trust-contacts/pull/91", s.mei, 0.4),
      ],
    }),
    bounty("hackathon-poster", {
      ...b.poster,
      category: "design",
      difficulty: "beginner",
      token: "tUSDC",
      reward: units(150, "tUSDC"),
      deadline: endOfDay(12),
      visibility: "everyone",
      review: poster,
      posterId: "hugo",
      org: o.campus,
      createdAt: at(-4),
      submissions: [sub("hackathon-poster", "theo", "https://www.figma.com/community/file/hackathon-poster-2027", s.theo, 1.5)],
    }),
    bounty("ambassador-walkthrough", {
      ...b.walkthrough,
      category: "community",
      difficulty: "beginner",
      token: "tUSDC",
      reward: units(200, "tUSDC"),
      deadline: endOfDay(10),
      visibility: "ambassadors",
      review: poster,
      posterId: "daniel",
      org: o.ambassadors,
      createdAt: at(-2),
    }),
    bounty("payout-gas-costs", {
      ...b.gas,
      category: "research",
      difficulty: "advanced",
      token: "tDAI",
      reward: units(400, "tDAI"),
      deadline: endOfDay(15),
      visibility: "members",
      review: council(2),
      posterId: "hugo",
      org: o.campus,
      createdAt: at(-1),
    }),
    // Paid: Sofía won; your own earlier submission was not selected.
    (() => {
      const winner = sub("docs-dark-theme", "sofia", "https://github.com/monark-community/docs/pull/190", s.sofia, 12, {
        status: "approved",
        decidedAt: at(-9),
        decisionHash: seededHash("approve:darkmode"),
      })
      const yours = sub("docs-dark-theme", YOU_ID, "https://github.com/monark-community/docs/pull/192", s.you, 11, { status: "not_selected", decidedAt: at(-9) })
      return bounty(
        "docs-dark-theme",
        {
          ...b.darkmode,
          category: "development",
          difficulty: "intermediate",
          token: "tUSDC",
          reward: units(350, "tUSDC"),
          deadline: endOfDay(-8),
          visibility: "everyone",
          review: poster,
          posterId: "ines",
          org: o.core,
          createdAt: at(-20),
          status: "paid",
          winnerSubmissionId: winner.id,
          submissions: [winner, yours],
        },
        [
          { id: "darkmode:approved", at: at(-9), kind: "approved", personId: "ines", hash: seededHash("approve:darkmode"), submissionId: winner.id },
          { id: "darkmode:paid", at: at(-9), kind: "paid", personId: "sofia", amount: units(350, "tUSDC"), hash: seededHash("approve:darkmode") },
        ]
      )
    })(),
    bounty(
      "quebec-study-night",
      {
        ...b.studynight,
        category: "community",
        difficulty: "beginner",
        token: "tDAI",
        reward: units(250, "tDAI"),
        deadline: endOfDay(-5),
        visibility: "ambassadors",
        review: poster,
        posterId: "daniel",
        org: o.ambassadors,
        createdAt: at(-30),
        status: "cancelled",
      },
      [{ id: "studynight:cancelled", at: at(-3), kind: "cancelled", personId: "daniel", amount: units(250, "tDAI"), hash: seededHash("cancel:studynight") }]
    ),
  ]

  return {
    version: 1,
    seededLocale: locale,
    youId: YOU_ID,
    wallet: {
      status: "disconnected",
      address: YOU_ADDRESS,
      name: copy.you,
      lastError: null,
      balances: { tUSDC: units(3200, "tUSDC"), tDAI: units(500, "tDAI"), tETH: units(0.8, "tETH") },
    },
    people,
    bounties,
    settings: { slow: false, failNext: false },
  }
}

/**
 * Re-translate the example content after a language switch, keeping every
 * change the visitor made (statuses, votes, their own bounties).
 */
export function localizeSeed(state: DemoState, copy: SeedCopy, locale: "en" | "fr"): DemoState {
  if (state.seededLocale === locale) return state
  const fresh = createSeed(copy, locale)
  const bounties = state.bounties.map((b) => {
    const f = fresh.bounties.find((x) => x.id === b.id)
    if (!f) return b
    return {
      ...b,
      title: f.title,
      description: f.description,
      criteria: f.criteria,
      skills: f.skills,
      org: f.org,
      submissions: b.submissions.map((s) => {
        const fs = f.submissions.find((x) => x.id === s.id)
        return {
          ...s,
          note: fs ? fs.note : s.note,
          votes: s.votes.map((v) => {
            const fv = fs?.votes.find((x) => x.personId === v.personId)
            return fv && v.note ? { ...v, note: fv.note } : v
          }),
        }
      }),
    }
  })
  const people = state.people.map((p) => (p.id === state.youId ? { ...p, name: copy.you } : p))
  return { ...state, seededLocale: locale, bounties, people, wallet: { ...state.wallet, name: copy.you } }
}
