import { usdValue } from "./tokens"
import { REPUTATION, type Bounty, type DemoState, type Person, type Submission } from "./types"

/** Pure read helpers shared by the app and the (server-rendered) home page. */

export function personById(s: Pick<DemoState, "people">, id: string): Person | undefined {
  return s.people.find((p) => p.id === id)
}

/** AI agents carry the id of their accountable operator. */
export function isAgent(p: Person | undefined): boolean {
  return !!p?.operatorId
}

/** The agents a person operates. */
export function agentsOf(s: Pick<DemoState, "people">, operatorId: string): Person[] {
  return s.people.filter((p) => p.operatorId === operatorId)
}

/**
 * Who may approve, reject or vote on a submission: never an agent, never the
 * contributor, and never the operator of the agent that submitted it.
 */
export function canDecide(s: Pick<DemoState, "people">, submission: Submission, deciderId: string): boolean {
  if (isAgent(personById(s, deciderId))) return false
  if (deciderId === submission.personId) return false
  return personById(s, submission.personId)?.operatorId !== deciderId
}

export function isClosed(b: Bounty, now = Date.now()): boolean {
  return b.status === "open" && new Date(b.deadline).getTime() < now
}

/** Display status: open bounties past their deadline read as "in review". */
export function displayStatus(b: Bounty, now = Date.now()): "open" | "closed" | "paid" | "cancelled" {
  if (b.status !== "open") return b.status
  return isClosed(b, now) ? "closed" : "open"
}

export function activeSubmissions(b: Bounty): Submission[] {
  return b.submissions.filter((x) => x.status === "review")
}

export type SubmitBlock = "own" | "closed" | "paid" | "cancelled" | "agents" | "visibility" | "pending" | null

/** Why the visitor can't submit to this bounty, or null if they can. */
export function submitBlock(s: DemoState, b: Bounty, now = Date.now()): SubmitBlock {
  const you = personById(s, s.youId)
  if (b.status === "paid") return "paid"
  if (b.status === "cancelled") return "cancelled"
  if (b.posterId === s.youId) return "own"
  if (isClosed(b, now)) return "closed"
  // The visitor is a person; agents submit through their own wallets.
  if (b.agents === "only") return "agents"
  if (b.visibility === "ambassadors" && !you?.roles.includes("ambassador")) return "visibility"
  if (b.visibility === "members" && !you?.roles.includes("member")) return "visibility"
  if (b.submissions.some((x) => x.personId === s.youId && x.status === "review")) return "pending"
  return null
}

export interface Standing {
  person: Person
  reputation: number
  completed: number
  /** USD value earned (testnet reference prices). */
  earnedUsd: number
  /** For operators: the reputation their agents earned, included in `reputation`. */
  viaAgents: number
}

/**
 * Reputation = base history + points for every approved submission in the
 * demo, plus, for operators, what their agents earned.
 */
export function standings(s: DemoState): Standing[] {
  const rows = s.people.map<Standing>((person) => ({
    person,
    reputation: person.baseReputation,
    completed: person.baseCompleted,
    earnedUsd: usdValue(person.baseEarned, "tUSDC"),
    viaAgents: 0,
  }))
  const byId = new Map(rows.map((r) => [r.person.id, r]))
  for (const b of s.bounties) {
    if (b.status !== "paid" || !b.winnerSubmissionId) continue
    const winner = b.submissions.find((x) => x.id === b.winnerSubmissionId)
    const row = winner ? byId.get(winner.personId) : undefined
    if (!row) continue
    row.reputation += REPUTATION[b.difficulty]
    row.completed += 1
    row.earnedUsd += usdValue(b.reward, b.token)
  }
  // Operators answer for their agents, so an agent's reputation also counts
  // for its operator. Payouts stay with the agent's wallet.
  for (const row of rows) {
    const operator = row.person.operatorId ? byId.get(row.person.operatorId) : undefined
    if (!operator) continue
    operator.reputation += row.reputation
    operator.viaAgents += row.reputation
  }
  return rows.sort((a, b) => b.reputation - a.reputation || b.completed - a.completed || a.person.name.localeCompare(b.person.name))
}

export function rankOf(s: DemoState, personId: string): { rank: number; total: number; standing?: Standing } {
  const list = standings(s)
  const index = list.findIndex((r) => r.person.id === personId)
  return { rank: index + 1, total: list.length, standing: list[index] }
}

export interface BoardSummary {
  open: number
  lockedUsd: number
}

export function boardSummary(s: DemoState): BoardSummary {
  let open = 0
  let lockedUsd = 0
  for (const b of s.bounties) {
    if (b.status !== "open") continue
    if (!isClosed(b)) open += 1
    lockedUsd += usdValue(b.reward, b.token)
  }
  return { open, lockedUsd }
}

export interface WaitingItem {
  bounty: Bounty
  kind: "review" | "vote"
  count: number
}

/** Decisions the visitor owes: submissions on their bounties, and validator votes. */
export function waitingOnYou(s: DemoState): WaitingItem[] {
  const items: WaitingItem[] = []
  for (const b of s.bounties) {
    if (b.status !== "open") continue
    const active = activeSubmissions(b)
    if (!active.length) continue
    if (b.review.kind === "poster" && b.posterId === s.youId) items.push({ bounty: b, kind: "review", count: active.length })
    if (b.review.kind === "validators" && b.review.validators.includes(s.youId)) {
      const need = active.filter((x) => !x.votes.some((v) => v.personId === s.youId)).length
      if (need) items.push({ bounty: b, kind: "vote", count: need })
    }
  }
  return items
}
