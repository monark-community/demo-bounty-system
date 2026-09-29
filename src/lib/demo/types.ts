/**
 * Domain types for the TaskFlow demo. Everything the UI knows about bounties,
 * submissions, wallets and transactions goes through these shapes, so the
 * simulated layer in this folder could be replaced by wagmi/viem calls without
 * UI changes.
 *
 * Amounts are integer base units stored as decimal strings (JSON-safe bigint),
 * e.g. 600 tUSDC with 6 decimals = "600000000".
 */

export type TokenSymbol = "tUSDC" | "tDAI" | "tETH"

export interface Token {
  symbol: TokenSymbol
  decimals: number
  /** Reference price in USD (testnet tokens, shared with the Monark demos). */
  usd: number
}

export type Category = "development" | "security" | "documentation" | "design" | "community" | "research"
export const CATEGORIES: Category[] = ["development", "security", "documentation", "design", "community", "research"]

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert"
export const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced", "expert"]

/** Reputation earned when a submission at this difficulty is approved. */
export const REPUTATION: Record<Difficulty, number> = { beginner: 10, intermediate: 25, advanced: 50, expert: 100 }

/** Who may submit. Everyone can read every bounty. */
export type Visibility = "everyone" | "members" | "ambassadors"
export type Role = "member" | "ambassador"

/** A person the demo knows about (poster, contributor, validator). */
export interface Person {
  id: string
  name: string
  address: string
  /** Handle shown in small print, e.g. "@ines.dev". */
  handle: string
  roles: Role[]
  /** Reputation earned before the demo's own history (keeps the leaderboard believable). */
  baseReputation: number
  /** Bounties completed before the demo's own history. */
  baseCompleted: number
  /** Rewards earned before the demo's own history, in tUSDC-equivalent base units (6 decimals). */
  baseEarned: string
}

/** poster: the poster approves or rejects. validators: a named council votes to a quorum. */
export type ReviewMode =
  | { kind: "poster" }
  | { kind: "validators"; validators: string[]; quorum: number }

export interface Vote {
  personId: string
  approve: boolean
  note?: string
  at: string
  hash: string
}

export type SubmissionStatus = "review" | "approved" | "rejected" | "not_selected" | "withdrawn"

export interface Submission {
  id: string
  personId: string
  link: string
  note: string
  at: string
  hash: string
  status: SubmissionStatus
  /** Rejection reason (always present when rejected by the poster). */
  decisionNote?: string
  decidedAt?: string
  decisionHash?: string
  votes: Vote[]
}

export type BountyStatus = "open" | "paid" | "cancelled"

export type EventKind = "posted" | "submitted" | "approved" | "rejected" | "vote" | "paid" | "cancelled"

export interface BountyEvent {
  id: string
  at: string
  kind: EventKind
  personId: string
  amount?: string
  hash: string
  /** For votes: the direction. */
  approve?: boolean
  submissionId?: string
}

export interface Bounty {
  id: string
  title: string
  description: string
  criteria: string[]
  category: Category
  difficulty: Difficulty
  skills: string[]
  token: TokenSymbol
  /** Base units locked in escrow. */
  reward: string
  deadline: string
  visibility: Visibility
  review: ReviewMode
  posterId: string
  /** Organisation or group the poster posts for. */
  org: string
  createdAt: string
  escrowAddress: string
  lockHash: string
  status: BountyStatus
  winnerSubmissionId?: string
  submissions: Submission[]
  events: BountyEvent[]
}

export type WalletStatus = "disconnected" | "connecting" | "connected"

export interface WalletState {
  status: WalletStatus
  address: string
  name: string
  lastError: "rejected" | null
  /** Spendable balances, base units per token. */
  balances: Record<TokenSymbol, string>
}

export interface DemoSettings {
  slow: boolean
  failNext: boolean
}

export interface DemoState {
  version: 1
  seededLocale: "en" | "fr"
  /** The visitor's person id. */
  youId: string
  wallet: WalletState
  people: Person[]
  bounties: Bounty[]
  settings: DemoSettings
}

/** Lifecycle of one simulated transaction, as the UI sees it. */
export type TxPhase = "idle" | "signing" | "pending" | "confirmed" | "failed"
export type TxError = "rejected" | "reverted"

export interface TxState {
  phase: TxPhase
  hash?: string
  error?: TxError
}

export interface TxSummary {
  /** Short title, e.g. "Release 600 tUSDC". */
  title: string
  /** Optional detail rows (label, value). */
  rows?: { label: string; value: string }[]
  /** Transactions that move value show the testnet disclaimer. */
  movesValue: boolean
  /** Off-chain signature (sign-in): no network fee row. */
  noFee?: boolean
}
