"use client"

import { randomAddress, randomHex } from "./ids"
import { getDemo, update, updateBounty } from "./store"
import { canDecide } from "./select"
import type { AgentPolicy, Bounty, BountyEvent, Category, DemoState, Difficulty, ReviewMode, Submission, TokenSymbol, Visibility } from "./types"

/**
 * State transitions, one per contract call. Each runs only after the
 * simulated transaction confirms, and receives its hash.
 */

const nowIso = () => new Date().toISOString()
const evId = () => `ev-${randomHex(10)}`

function adjustBalance(s: DemoState, token: TokenSymbol, delta: bigint): DemoState {
  const current = BigInt(s.wallet.balances[token])
  return { ...s, wallet: { ...s.wallet, balances: { ...s.wallet.balances, [token]: (current + delta).toString() } } }
}

function slugify(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
  return `${base || "bounty"}-${randomHex(4)}`
}

export interface BountyDraft {
  title: string
  description: string
  criteria: string[]
  category: Category
  difficulty: Difficulty
  skills: string[]
  token: TokenSymbol
  reward: string
  deadline: string
  visibility: Visibility
  agents: AgentPolicy
  review: ReviewMode
  org: string
}

/** lock(): the reward leaves the poster's wallet and is held by a new escrow. */
export function postBounty(draft: BountyDraft, hash: string): string {
  const demo = getDemo()
  if (!demo) return ""
  const id = slugify(draft.title)
  const at = nowIso()
  const bounty: Bounty = {
    ...draft,
    id,
    posterId: demo.youId,
    createdAt: at,
    escrowAddress: randomAddress(),
    lockHash: hash,
    status: "open",
    submissions: [],
    events: [{ id: evId(), at, kind: "posted", personId: demo.youId, amount: draft.reward, hash }],
  }
  update((s) => adjustBalance({ ...s, bounties: [bounty, ...s.bounties] }, draft.token, -BigInt(draft.reward)))
  return id
}

/** submit(): records a link and note with a timestamp. */
export function submitWork(bountyId: string, link: string, note: string, hash: string, personId?: string) {
  const demo = getDemo()
  if (!demo) return
  const who = personId ?? demo.youId
  const at = nowIso()
  const submission: Submission = { id: `${bountyId}:${who}:${randomHex(4)}`, personId: who, link, note, at, hash, status: "review", votes: [] }
  updateBounty(bountyId, (b) => ({
    ...b,
    submissions: [...b.submissions, submission],
    events: [...b.events, { id: evId(), at, kind: "submitted", personId: who, hash, submissionId: submission.id }],
  }))
}

/** Pays the winner from escrow and closes the other submissions. */
function payout(b: Bounty, submissionId: string, hash: string, at: string): Bounty {
  const winner = b.submissions.find((x) => x.id === submissionId)
  if (!winner) return b
  return {
    ...b,
    status: "paid",
    winnerSubmissionId: submissionId,
    submissions: b.submissions.map((x) =>
      x.id === submissionId
        ? { ...x, status: "approved", decidedAt: at, decisionHash: hash }
        : x.status === "review"
          ? { ...x, status: "not_selected", decidedAt: at }
          : x
    ),
    events: [...b.events, { id: evId(), at, kind: "paid", personId: winner.personId, amount: b.reward, hash }],
  }
}

function creditIfYou(s: DemoState, bounty: Bounty, personId: string): DemoState {
  return personId === s.youId ? adjustBalance(s, bounty.token, BigInt(bounty.reward)) : s
}

/** approve(): poster review. Approval and payout are one transaction. */
export function approveSubmission(bountyId: string, submissionId: string, hash: string, deciderId?: string) {
  const demo = getDemo()
  if (!demo) return
  const decider = deciderId ?? demo.youId
  const at = nowIso()
  update((s) => {
    const b = s.bounties.find((x) => x.id === bountyId)
    const winner = b?.submissions.find((x) => x.id === submissionId)
    if (!b || !winner || b.status !== "open" || !canDecide(s, winner, decider)) return s
    const approved: BountyEvent = { id: evId(), at, kind: "approved", personId: decider, hash, submissionId }
    const next = payout({ ...b, events: [...b.events, approved] }, submissionId, hash, at)
    return creditIfYou({ ...s, bounties: s.bounties.map((x) => (x.id === bountyId ? next : x)) }, b, winner.personId)
  })
}

/** reject(): poster review. A reason is mandatory. */
export function rejectSubmission(bountyId: string, submissionId: string, note: string, hash: string, deciderId?: string) {
  const demo = getDemo()
  if (!demo) return
  const decider = deciderId ?? demo.youId
  const at = nowIso()
  updateBounty(bountyId, (b) => ({
    ...b,
    submissions: b.submissions.map((x) =>
      x.id === submissionId ? { ...x, status: "rejected", decisionNote: note, decidedAt: at, decisionHash: hash } : x
    ),
    events: [...b.events, { id: evId(), at, kind: "rejected", personId: decider, hash, submissionId }],
  }))
}

export type VoteOutcome = "counted" | "approved" | "rejected"

/**
 * vote(): validator review. Reaching the quorum of approvals pays out in the
 * same transaction; once the quorum can no longer be reached, the submission
 * is rejected.
 */
export function castVote(bountyId: string, submissionId: string, personId: string, approve: boolean, note: string | undefined, hash: string): VoteOutcome {
  let outcome: VoteOutcome = "counted"
  const at = nowIso()
  update((s) => {
    const b = s.bounties.find((x) => x.id === bountyId)
    if (!b || b.review.kind !== "validators" || b.status !== "open") return s
    const { validators, quorum } = b.review
    const target = b.submissions.find((x) => x.id === submissionId)
    if (!target || target.status !== "review" || target.votes.some((v) => v.personId === personId)) return s
    if (!canDecide(s, target, personId)) return s
    const votes = [...target.votes, { personId, approve, note, at, hash }]
    const approvals = votes.filter((v) => v.approve).length
    const rejections = votes.length - approvals
    let next: Bounty = {
      ...b,
      submissions: b.submissions.map((x) => (x.id === submissionId ? { ...x, votes } : x)),
      events: [...b.events, { id: evId(), at, kind: "vote", personId, approve, hash, submissionId }],
    }
    if (approvals >= quorum) {
      outcome = "approved"
      next = payout(next, submissionId, hash, at)
      return creditIfYou({ ...s, bounties: s.bounties.map((x) => (x.id === bountyId ? next : x)) }, b, target.personId)
    }
    if (rejections > validators.length - quorum) {
      outcome = "rejected"
      const reason = votes.find((v) => !v.approve && v.note)?.note
      next = {
        ...next,
        submissions: next.submissions.map((x) =>
          x.id === submissionId ? { ...x, status: "rejected", decisionNote: reason, decidedAt: at, decisionHash: hash } : x
        ),
      }
    }
    return { ...s, bounties: s.bounties.map((x) => (x.id === bountyId ? next : x)) }
  })
  return outcome
}

/** cancel(): only while no submission waits for a decision. Refunds the poster. */
export function cancelBounty(bountyId: string, hash: string) {
  const demo = getDemo()
  if (!demo) return
  const at = nowIso()
  update((s) => {
    const b = s.bounties.find((x) => x.id === bountyId)
    if (!b || b.status !== "open") return s
    const next: Bounty = {
      ...b,
      status: "cancelled",
      events: [...b.events, { id: evId(), at, kind: "cancelled", personId: b.posterId, amount: b.reward, hash }],
    }
    const withBounty = { ...s, bounties: s.bounties.map((x) => (x.id === bountyId ? next : x)) }
    return b.posterId === s.youId ? adjustBalance(withBounty, b.token, BigInt(b.reward)) : withBounty
  })
}

/** Demo control: give or remove the ambassador role on your own wallet. */
export function setAmbassador(on: boolean) {
  update((s) => ({
    ...s,
    people: s.people.map((p) =>
      p.id === s.youId
        ? { ...p, roles: on ? Array.from(new Set([...p.roles, "ambassador" as const])) : p.roles.filter((r) => r !== "ambassador") }
        : p
    ),
  }))
}
