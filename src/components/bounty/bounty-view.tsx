"use client"

import { ArrowLeftIcon, ExternalLinkIcon, InfoIcon, SendIcon, ShieldCheckIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { useAppCopy } from "@/components/demo/app-provider"
import { ConnectCard } from "@/components/demo/app-frame"
import { Disclaimer } from "@/components/demo/disclaimer"
import { TxFeedback } from "@/components/demo/tx-feedback"
import { Button } from "@/components/ui/button"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { formatDate, formatDateTime, formatRelative, formatToken, formatUnits, shortHash } from "@/lib/format"
import { useTx } from "@/lib/demo/chain"
import { takeJustPosted } from "@/lib/demo/flash"
import { approveSubmission, castVote, rejectSubmission } from "@/lib/demo/ops"
import { activeSubmissions, displayStatus, personById, submitBlock } from "@/lib/demo/select"
import { useDemo } from "@/lib/demo/store"
import { TOKENS } from "@/lib/demo/tokens"
import { REPUTATION, type Bounty, type BountyEvent, type DemoState, type Submission } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { CancelDialog, RejectDialog, SubmitDialog } from "./dialogs"
import { EscrowRail } from "./escrow-rail"
import { StatusPill } from "./ticket"
import { nameOf } from "./ticket-props"
import { VoteTally, type TallyNode } from "./vote-tally"

type Flash = "locked" | "released" | "refunded" | null

export function BountyView({ id }: { id: string }) {
  const demo = useDemo()
  const { app, labels, locale } = useAppCopy()
  const c = app.bounty
  const [flash, setFlash] = useState<Flash>(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const bounty = demo?.bounties.find((x) => x.id === id)

  const [now] = useState(() => Date.now())
  // Play the lock animation once, right after this bounty was published.
  const [lockChecked, setLockChecked] = useState(false)
  if (bounty && !lockChecked) {
    setLockChecked(true)
    if (takeJustPosted(bounty.id)) setFlash("locked")
  }

  // Released and refunded animations follow the status change they report.
  const status = bounty?.status
  const [seenStatus, setSeenStatus] = useState(status)
  if (status !== seenStatus) {
    setSeenStatus(status)
    if (seenStatus === "open" && status === "paid") setFlash("released")
    if (seenStatus === "open" && status === "cancelled") setFlash("refunded")
  }

  if (!demo) return null
  if (!bounty) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <p role="alert" className="text-lg">
          {c.notFound}
        </p>
        <Button asChild variant="outline">
          <Link href={href(locale, "/app")}>
            <ArrowLeftIcon aria-hidden="true" />
            {c.back}
          </Link>
        </Button>
      </div>
    )
  }

  const st = displayStatus(bounty, now)
  const poster = personById(demo, bounty.posterId)
  const posterName = nameOf(demo, bounty.posterId, labels.you)
  const winnerSub = bounty.winnerSubmissionId ? bounty.submissions.find((x) => x.id === bounty.winnerSubmissionId) : undefined
  const winner = winnerSub ? personById(demo, winnerSub.personId) : undefined
  const amount = formatUnits(bounty.reward, TOKENS[bounty.token].decimals, locale)
  const connected = demo.wallet.status === "connected"
  const isPoster = bounty.posterId === demo.youId
  const isValidator = bounty.review.kind === "validators" && bounty.review.validators.includes(demo.youId)
  const reviewLabel =
    bounty.review.kind === "poster"
      ? labels.review.poster
      : t(labels.review.validators, { quorum: bounty.review.quorum, total: bounty.review.validators.length })
  const railState = bounty.status === "paid" ? "released" : bounty.status === "cancelled" ? "refunded" : "locked"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href={href(locale, "/app")}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground sm:min-h-0"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          {c.back}
        </Link>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <StatusPill status={st} label={labels.bountyStatus[st]} />
          <span>{t(c.postedBy, { name: posterName, org: bounty.org })}</span>
          <span aria-hidden="true">·</span>
          <span>{t(c.postedOn, { date: formatDate(bounty.createdAt, locale) })}</span>
        </p>
        <h1 className="max-w-4xl text-3xl font-extrabold tracking-display text-balance sm:text-4xl">{bounty.title}</h1>
      </div>

      <section aria-labelledby="escrow-title" className="rounded-3xl border bg-card p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="escrow-title" className="eyebrow text-muted-foreground">
            {c.escrow.title}
          </h2>
          <p className="text-sm font-semibold" aria-live="polite">
            {bounty.status === "paid" && winner
              ? t(c.escrow.released, { name: nameOf(demo, winner.id, labels.you) })
              : bounty.status === "cancelled"
                ? t(c.escrow.refunded, { name: posterName })
                : t(c.escrow.locked, { amount: formatToken(bounty.reward, bounty.token, locale) })}
          </p>
        </div>
        <EscrowRail
          state={railState}
          amount={amount}
          token={bounty.token}
          poster={{ name: posterName, address: poster?.address, caption: bounty.org }}
          winner={winner ? { name: nameOf(demo, winner.id, labels.you), address: winner.address, caption: winner.handle } : undefined}
          lockedLabel={c.escrow.lockedShort}
          releasedLabel={labels.bountyStatus.paid}
          refundedLabel={labels.bountyStatus.cancelled}
          pendingWinner={reviewLabel}
          justChanged={flash !== null}
        />
        <dl className="mt-6 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{c.escrow.contract}</dt>
            <dd>
              <WalletAddress address={bounty.escrowAddress} className="text-sm" />
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{c.escrow.lockTx}</dt>
            <dd className="font-mono text-sm">{shortHash(bounty.lockHash)}</dd>
          </div>
        </dl>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {c.escrow.explain}
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <section aria-labelledby="brief-title" className="flex flex-col gap-4">
            <h2 id="brief-title" className="text-xl font-bold">
              {c.brief}
            </h2>
            <p className="max-w-[68ch]">{bounty.description}</p>
            <h3 className="mt-2 font-bold">{c.criteria}</h3>
            <ul className="flex max-w-[68ch] flex-col gap-2">
              {bounty.criteria.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-2 size-2 shrink-0 rounded-full border-2 border-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="subs-title" className="flex flex-col gap-4">
            <h2 id="subs-title" className="text-xl font-bold">
              {c.submissions.title} <span className="text-muted-foreground">({bounty.submissions.length})</span>
            </h2>
            {bounty.submissions.length ? (
              <ul className="flex flex-col gap-3">
                {[...bounty.submissions]
                  .sort((a, b) => rankSub(a) - rankSub(b) || a.at.localeCompare(b.at))
                  .map((s) => (
                    <li key={s.id}>
                      <SubmissionCard demo={demo} bounty={bounty} submission={s} />
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed p-5 text-muted-foreground">{isPoster ? c.submissions.emptyOwn : c.submissions.empty}</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <YourMove
            demo={demo}
            bounty={bounty}
            connected={connected}
            isValidator={isValidator}
            onSubmit={() => setSubmitOpen(true)}
            onCancel={() => setCancelOpen(true)}
          />

          <section aria-labelledby="details-title" className="rounded-2xl border bg-card p-4">
            <h2 id="details-title" className="eyebrow text-muted-foreground">
              {c.details}
            </h2>
            <dl className="mt-3 flex flex-col divide-y text-sm">
              <Row label={c.deadline} value={`${formatDate(bounty.deadline, locale)} · ${formatRelative(bounty.deadline, locale, now)}`} />
              <Row label={c.category} value={labels.category[bounty.category]} />
              <Row label={c.difficulty} value={labels.difficulty[bounty.difficulty]} />
              <Row label={c.reputation} value={`+${REPUTATION[bounty.difficulty]}`} />
              <Row label={c.visibility} value={labels.visibility[bounty.visibility]} />
              <Row label={c.review} value={reviewLabel} />
              {bounty.skills.length ? <Row label={c.skills} value={bounty.skills.join(", ")} /> : null}
            </dl>
          </section>

          <History demo={demo} bounty={bounty} />
        </aside>
      </div>

      {connected ? <SubmitDialog bounty={bounty} open={submitOpen} onOpenChange={setSubmitOpen} /> : null}
      {isPoster ? <CancelDialog bounty={bounty} open={cancelOpen} onOpenChange={setCancelOpen} onDone={() => undefined} /> : null}
    </div>
  )
}

function rankSub(s: Submission) {
  return s.status === "approved" ? 0 : s.status === "review" ? 1 : 2
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  )
}

function YourMove({
  demo,
  bounty,
  connected,
  isValidator,
  onSubmit,
  onCancel,
}: {
  demo: DemoState
  bounty: Bounty
  connected: boolean
  isValidator: boolean
  onSubmit: () => void
  onCancel: () => void
}) {
  const { app, locale } = useAppCopy()
  const a = app.bounty.action
  const block = submitBlock(demo, bounty)
  const hadRejected = bounty.submissions.some((x) => x.personId === demo.youId && x.status === "rejected")
  const canCancel = bounty.posterId === demo.youId && bounty.status === "open" && activeSubmissions(bounty).length === 0
  const cancelBlocked = bounty.posterId === demo.youId && bounty.status === "open" && !canCancel

  if (!connected) return <ConnectCard />

  const reason =
    block === "visibility"
      ? t(a.reasons.visibility, { role: bounty.visibility === "ambassadors" ? a.roleNames.ambassadors : a.roleNames.members })
      : block === "closed"
        ? t(a.reasons.closed, { date: formatDate(bounty.deadline, locale) })
        : block
          ? a.reasons[block]
          : null

  return (
    <section aria-labelledby="move-title" className="flex flex-col gap-3 rounded-2xl border-2 border-primary/60 bg-card p-4">
      <h2 id="move-title" className="eyebrow text-muted-foreground">
        {a.title}
      </h2>
      {isValidator ? (
        <p className="flex items-start gap-2 text-sm">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          {app.bounty.vote.youAreValidator}
        </p>
      ) : null}
      {reason ? <p className="text-sm">{reason}</p> : null}
      {block === "visibility" && bounty.visibility === "ambassadors" ? (
        <p className="text-xs text-muted-foreground">{a.ambassadorHint}</p>
      ) : null}
      {block === null ? (
        <Button size="lg" className="w-full" onClick={onSubmit}>
          <SendIcon aria-hidden="true" />
          {hadRejected ? a.resubmit : a.submit}
        </Button>
      ) : null}
      {canCancel ? (
        <Button variant="destructive" className="w-full" onClick={onCancel}>
          {app.bounty.cancel.button}
        </Button>
      ) : null}
      {cancelBlocked ? <p className="text-xs text-muted-foreground">{app.bounty.cancel.blocked}</p> : null}
    </section>
  )
}

function SubmissionCard({ demo, bounty, submission }: { demo: DemoState; bounty: Bounty; submission: Submission }) {
  const { app, labels, locale, disclaimer } = useAppCopy()
  const c = app.bounty.submissions
  const v = app.bounty.vote
  const person = personById(demo, submission.personId)
  const name = nameOf(demo, submission.personId, labels.you)
  const tx = useTx()
  const sim = useTx()
  const [rejectMode, setRejectMode] = useState<"poster" | "vote" | null>(null)
  const [freshVoter, setFreshVoter] = useState<string | null>(null)
  const connected = demo.wallet.status === "connected"
  const inReview = submission.status === "review" && bounty.status === "open"
  const isPoster = bounty.posterId === demo.youId
  const isYours = submission.personId === demo.youId
  const amount = formatToken(bounty.reward, bounty.token, locale)
  const posterMode = bounty.review.kind === "poster"
  const validators = bounty.review.kind === "validators" ? bounty.review.validators : []
  const quorum = bounty.review.kind === "validators" ? bounty.review.quorum : 0
  const youVoted = submission.votes.find((x) => x.personId === demo.youId)
  const canVote = connected && inReview && validators.includes(demo.youId) && !youVoted
  const statusLabel =
    submission.status === "review" && !posterMode ? labels.submissionStatus.voting : labels.submissionStatus[submission.status]

  function toastPaid() {
    const points = REPUTATION[bounty.difficulty]
    if (isYours) toast.success(t(app.toasts.paidYou, { amount, points }))
    else toast.success(t(app.toasts.paid, { name, amount }))
  }

  async function approve() {
    const ok = await tx.run(
      {
        title: t(app.summaries.release, { amount, name }),
        rows: [
          { label: app.summaries.releaseRows.bounty, value: bounty.title },
          { label: app.summaries.releaseRows.to, value: name },
        ],
        movesValue: true,
      },
      (hash) => approveSubmission(bounty.id, submission.id, hash)
    )
    if (ok) toastPaid()
  }

  async function voteApprove() {
    const result: { outcome: string | null } = { outcome: null }
    const ok = await tx.run(
      {
        title: t(app.summaries.vote, { direction: app.summaries.voteDirection.approve }),
        rows: [
          { label: app.summaries.voteRows.bounty, value: bounty.title },
          { label: app.summaries.voteRows.submission, value: name },
        ],
        movesValue: true,
      },
      (hash) => {
        result.outcome = castVote(bounty.id, submission.id, demo.youId, true, undefined, hash)
        setFreshVoter(demo.youId)
      }
    )
    if (ok) {
      if (result.outcome === "approved") toast.success(t(app.toasts.quorum, { name, amount }))
      else toast.success(app.toasts.voted)
    }
  }

  async function simulateOtherVote(personId: string) {
    const result: { outcome: string | null } = { outcome: null }
    const ok = await sim.run(
      { title: "", movesValue: false },
      (hash) => {
        result.outcome = castVote(bounty.id, submission.id, personId, true, undefined, hash)
        setFreshVoter(personId)
      },
      { skipPrompt: true }
    )
    if (ok && result.outcome === "approved") {
      if (isYours) toastPaid()
      else toast.success(t(app.toasts.quorum, { name, amount }))
    }
  }

  async function simulatePoster(approveIt: boolean) {
    const ok = await sim.run(
      { title: "", movesValue: false },
      (hash) => {
        if (approveIt) approveSubmission(bounty.id, submission.id, hash, bounty.posterId)
        else rejectSubmission(bounty.id, submission.id, c.simulatedRejectNote, hash, bounty.posterId)
      },
      { skipPrompt: true }
    )
    if (!ok) return
    if (approveIt) toastPaid()
    else toast(app.toasts.rejectedYou)
  }

  async function simulateValidators() {
    const ok = await sim.run(
      { title: "", movesValue: false },
      (hash) => {
        for (const vid of validators) {
          if (vid === demo.youId) continue
          const outcome = castVote(bounty.id, submission.id, vid, true, undefined, `${hash.slice(0, -2)}${vid.slice(0, 2)}`)
          if (outcome === "approved") break
        }
      },
      { skipPrompt: true }
    )
    if (ok) toastPaid()
  }

  const nodes: TallyNode[] = validators.map((vid) => {
    const p = personById(demo, vid)
    const vote = submission.votes.find((x) => x.personId === vid)
    const n = nameOf(demo, vid, labels.you)
    return {
      id: vid,
      name: n,
      initials: (p?.name ?? n)
        .split(/\s|-/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      vote: vote ? (vote.approve ? "approve" : "reject") : null,
      isYou: vid === demo.youId,
      fresh: freshVoter === vid,
    }
  })
  const approvals = submission.votes.filter((x) => x.approve).length
  const othersToSimulate = validators.filter((vid) => vid !== demo.youId && !submission.votes.some((x) => x.personId === vid))
  const tone =
    submission.status === "approved" ? "border-success/60" : submission.status === "rejected" ? "border-destructive/40" : inReview ? "border-border" : "border-border opacity-90"

  return (
    <article className={cn("flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5", tone)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {person ? <WalletAvatar address={person.address} size={36} /> : null}
          <div className="min-w-0 leading-tight">
            <p className="truncate font-bold">
              {isYours ? c.yourSubmission : name}
              {!isYours && person ? <span className="ml-1.5 text-xs font-semibold text-muted-foreground">{person.handle}</span> : null}
            </p>
            <p className="text-xs text-muted-foreground">
              <time dateTime={submission.at}>{t(c.submittedAt, { date: formatRelative(submission.at, locale) })}</time>
              <span aria-hidden="true"> · </span>
              <span className="font-mono">{shortHash(submission.hash, 6, 4)}</span>
            </p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-bold",
            submission.status === "approved" && "tf-stamp border-success/60 text-success",
            submission.status === "rejected" && "border-destructive/50 text-destructive",
            submission.status === "review" && "border-warning/60 text-warning",
            (submission.status === "not_selected" || submission.status === "withdrawn") && "border-input text-muted-foreground"
          )}
        >
          {statusLabel}
        </span>
      </header>

      <div className="flex flex-col gap-2">
        <a
          href={submission.link}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex max-w-full items-center gap-1.5 text-sm font-semibold break-all text-primary-ink underline underline-offset-4"
        >
          <ExternalLinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
          {submission.link.replace(/^https:\/\//, "")}
          <span className="sr-only">({c.openLink})</span>
        </a>
        <p className="text-sm">
          <span className="sr-only">{c.note}: </span>
          {submission.note}
        </p>
      </div>

      {submission.status === "rejected" && submission.decisionNote ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="text-xs font-bold text-destructive">{c.decision}</p>
          <p className="mt-1">{submission.decisionNote}</p>
        </div>
      ) : null}

      {!posterMode && (inReview || submission.votes.length > 0) ? (
        <div className="rounded-xl bg-muted/50 p-3">
          <VoteTally
            nodes={nodes}
            quorum={quorum}
            label={t(v.tally, { approve: approvals, quorum })}
            reachedLabel={v.quorumReached}
            approveLabel={v.approved}
            rejectLabel={v.rejected}
            notVotedLabel={v.notVoted}
          />
          {youVoted ? (
            <p className="mt-3 text-xs font-semibold text-muted-foreground">
              {t(v.youVoted, { direction: youVoted.approve ? app.summaries.voteDirection.approve : app.summaries.voteDirection.reject })}
            </p>
          ) : null}
          {submission.votes
            .filter((x) => x.note)
            .map((x) => (
              <p key={x.personId} className="mt-2 text-xs">
                <span className="font-bold">{nameOf(demo, x.personId, labels.you)}: </span>
                {x.note}
              </p>
            ))}
        </div>
      ) : null}

      {/* Actions for whoever holds the decision. */}
      {inReview && posterMode && isPoster && connected ? (
        <div className="flex flex-col gap-3 border-t pt-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void approve()} disabled={tx.busy}>
              {c.approve}
            </Button>
            <Button variant="outline" onClick={() => setRejectMode("poster")} disabled={tx.busy}>
              <XIcon aria-hidden="true" />
              {c.reject}
            </Button>
          </div>
          <Disclaimer text={disclaimer} />
        </div>
      ) : null}

      {canVote ? (
        <div className="flex flex-col gap-3 border-t pt-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void voteApprove()} disabled={tx.busy}>
              {v.approve}
            </Button>
            <Button variant="outline" onClick={() => setRejectMode("vote")} disabled={tx.busy}>
              <XIcon aria-hidden="true" />
              {v.reject}
            </Button>
          </div>
          <Disclaimer text={disclaimer} />
        </div>
      ) : null}

      <TxFeedback state={tx.state} onDismiss={() => tx.reset()} />

      {/* Demo-only: play the other side of the flow. */}
      {inReview && ((isYours && connected) || (!posterMode && youVoted && othersToSimulate.length > 0)) ? (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed p-3">
          <p className="text-xs font-bold">{c.simulateTitle}</p>
          {isYours && posterMode ? <p className="text-xs text-muted-foreground">{c.simulateBody}</p> : null}
          <div className="flex flex-wrap gap-2">
            {isYours && posterMode ? (
              <>
                <Button size="sm" variant="outline" disabled={sim.busy} onClick={() => void simulatePoster(true)}>
                  {c.simulateApprove}
                </Button>
                <Button size="sm" variant="outline" disabled={sim.busy} onClick={() => void simulatePoster(false)}>
                  {c.simulateReject}
                </Button>
              </>
            ) : null}
            {isYours && !posterMode ? (
              <Button size="sm" variant="outline" disabled={sim.busy} onClick={() => void simulateValidators()}>
                {c.simulateVote}
              </Button>
            ) : null}
            {!isYours
              ? othersToSimulate.map((vid) => (
                  <Button key={vid} size="sm" variant="outline" disabled={sim.busy} onClick={() => void simulateOtherVote(vid)}>
                    {t(v.simulateOther, { name: nameOf(demo, vid, labels.you) })}
                  </Button>
                ))
              : null}
          </div>
          <TxFeedback state={sim.state} onDismiss={() => sim.reset()} />
        </div>
      ) : null}

      {rejectMode ? (
        <RejectDialog
          bounty={bounty}
          submission={submission}
          mode={rejectMode}
          open={rejectMode !== null}
          onOpenChange={(o) => !o && setRejectMode(null)}
        />
      ) : null}
    </article>
  )
}

function History({ demo, bounty }: { demo: DemoState; bounty: Bounty }) {
  const { app, labels, locale } = useAppCopy()
  const h = app.bounty.activity
  const subOwner = (e: BountyEvent) => {
    const s = e.submissionId ? bounty.submissions.find((x) => x.id === e.submissionId) : undefined
    return s ? nameOf(demo, s.personId, labels.you) : ""
  }
  const line = (e: BountyEvent) => {
    const name = nameOf(demo, e.personId, labels.you)
    const amount = e.amount ? formatToken(e.amount, bounty.token, locale) : ""
    const key = e.kind === "vote" ? (e.approve ? "vote_approve" : "vote_reject") : e.kind
    return t(h.kinds[key], { name, amount, who: subOwner(e) })
  }
  const events = [...bounty.events].reverse()

  return (
    <section aria-labelledby="history-title" className="rounded-2xl border bg-card p-4">
      <h2 id="history-title" className="eyebrow text-muted-foreground">
        {h.title}
      </h2>
      {events.length ? (
        <ol className="mt-3 flex flex-col gap-3">
          {events.map((e) => (
            <li key={e.id} className="tf-slide-in relative border-l-2 pl-3 text-sm">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-1.5 -left-[5px] size-2 rounded-full",
                  e.kind === "paid" || e.kind === "posted" ? "bg-primary" : "bg-input"
                )}
              />
              <p className="leading-snug">{line(e)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <time dateTime={e.at}>{formatDateTime(e.at, locale)}</time>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">{shortHash(e.hash, 6, 4)}</span>
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{h.empty}</p>
      )}
    </section>
  )
}
