"use client"

import { useId, useState } from "react"
import { toast } from "sonner"

import { useAppCopy } from "@/components/demo/app-provider"
import { Disclaimer } from "@/components/demo/disclaimer"
import { TxFeedback } from "@/components/demo/tx-feedback"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { t } from "@/i18n/t"
import { formatToken } from "@/lib/format"
import { useTx } from "@/lib/demo/chain"
import { cancelBounty, castVote, rejectSubmission, submitWork, type VoteOutcome } from "@/lib/demo/ops"
import { getDemo } from "@/lib/demo/store"
import type { Bounty, Submission } from "@/lib/demo/types"

import { nameOf } from "./ticket-props"

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-sm font-semibold text-destructive">
      {message}
    </p>
  )
}

/** Flow 3: submit work to a bounty. */
export function SubmitDialog({ bounty, open, onOpenChange }: { bounty: Bounty; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { app } = useAppCopy()
  const c = app.submit
  const ids = useId()
  const tx = useTx()
  const [link, setLink] = useState("")
  const [note, setNote] = useState("")
  const [criteria, setCriteria] = useState(false)
  const [errors, setErrors] = useState<{ link?: string; note?: string; criteria?: string }>({})

  function validate() {
    const e: typeof errors = {}
    try {
      const u = new URL(link.trim())
      if (u.protocol !== "https:" || !u.hostname.includes(".")) e.link = c.errors.link
    } catch {
      e.link = c.errors.link
    }
    const n = note.trim().length
    if (n < 20) e.note = c.errors.noteShort
    else if (n > 600) e.note = c.errors.noteLong
    if (!criteria) e.criteria = c.errors.criteria
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function send() {
    if (!validate()) return
    const ok = await tx.run(
      {
        title: app.summaries.submit,
        rows: [
          { label: app.summaries.submitRows.bounty, value: bounty.title },
          { label: app.summaries.submitRows.link, value: link.trim() },
        ],
        movesValue: false,
      },
      (hash) => submitWork(bounty.id, link.trim(), note.trim(), hash)
    )
    if (ok) {
      toast.success(c.done)
      onOpenChange(false)
      setLink("")
      setNote("")
      setCriteria(false)
      tx.reset()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (tx.busy) return
        if (!o) tx.reset()
        onOpenChange(o)
      }}
    >
      <DialogContent closeLabel={app.close} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{c.title}</DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${ids}-link`} className="font-bold">
              {c.link}
            </Label>
            <Input
              id={`${ids}-link`}
              type="url"
              inputMode="url"
              autoComplete="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={c.linkPlaceholder}
              aria-invalid={!!errors.link}
              aria-describedby={`${ids}-link-hint ${ids}-link-err`}
            />
            <p id={`${ids}-link-hint`} className="text-xs text-muted-foreground">
              {c.linkHint}
            </p>
            <FieldError id={`${ids}-link-err`} message={errors.link} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${ids}-note`} className="font-bold">
              {c.note}
            </Label>
            <Textarea
              id={`${ids}-note`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              aria-invalid={!!errors.note}
              aria-describedby={`${ids}-note-hint ${ids}-note-err`}
            />
            <p id={`${ids}-note-hint`} className="flex justify-between gap-3 text-xs text-muted-foreground">
              <span>{c.noteHint}</span>
              <span className="tabular-nums">{note.trim().length}/600</span>
            </p>
            <FieldError id={`${ids}-note-err`} message={errors.note} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id={`${ids}-criteria`}
                checked={criteria}
                onCheckedChange={(v) => setCriteria(v === true)}
                aria-invalid={!!errors.criteria}
                aria-describedby={`${ids}-criteria-err`}
                className="mt-0.5"
              />
              <Label htmlFor={`${ids}-criteria`} className="leading-snug">
                {c.criteria}
              </Label>
            </div>
            <FieldError id={`${ids}-criteria-err`} message={errors.criteria} />
          </div>
          <TxFeedback state={tx.state} onRetry={() => void send()} />
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={tx.busy}>
              {c.cancel}
            </Button>
            <Button type="submit" disabled={tx.busy}>
              {c.send}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Flow 4 (poster rejects with a reason) and flow 5 (validator votes to reject). */
export function RejectDialog({
  bounty,
  submission,
  mode,
  open,
  onOpenChange,
}: {
  bounty: Bounty
  submission: Submission
  mode: "poster" | "vote"
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { app, labels } = useAppCopy()
  const c = app.reject
  const ids = useId()
  const tx = useTx()
  const [note, setNote] = useState("")
  const [error, setError] = useState<string>()
  const demo = getDemo()
  const who = demo ? nameOf(demo, submission.personId, labels.you) : ""

  async function send() {
    if (note.trim().length < 10) {
      setError(c.error)
      return
    }
    setError(undefined)
    const reason = note.trim()
    const result: { outcome: VoteOutcome | null } = { outcome: null }
    const ok = await tx.run(
      mode === "poster"
        ? {
            title: t(app.summaries.reject, { name: who }),
            rows: [
              { label: app.summaries.rejectRows.bounty, value: bounty.title },
              { label: app.summaries.rejectRows.note, value: reason },
            ],
            movesValue: false,
          }
        : {
            title: t(app.summaries.vote, { direction: app.summaries.voteDirection.reject }),
            rows: [
              { label: app.summaries.voteRows.bounty, value: bounty.title },
              { label: app.summaries.voteRows.submission, value: who },
            ],
            movesValue: false,
          },
      (hash) => {
        if (mode === "poster") rejectSubmission(bounty.id, submission.id, reason, hash)
        else if (demo) result.outcome = castVote(bounty.id, submission.id, demo.youId, false, reason, hash)
      }
    )
    if (ok) {
      toast.success(mode === "poster" ? t(app.toasts.rejected, { name: who }) : result.outcome === "rejected" ? app.bounty.vote.rejectOutcome : app.toasts.voted)
      setNote("")
      tx.reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (tx.busy) return
        if (!o) tx.reset()
        onOpenChange(o)
      }}
    >
      <DialogContent closeLabel={app.close} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{mode === "poster" ? c.title : c.voteTitle}</DialogTitle>
          <DialogDescription>{mode === "poster" ? c.description : c.voteDescription}</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void send()
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${ids}-note`} className="font-bold">
              {c.note}
            </Label>
            <Textarea
              id={`${ids}-note`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder={c.placeholder}
              aria-invalid={!!error}
              aria-describedby={`${ids}-hint ${ids}-err`}
            />
            <p id={`${ids}-hint`} className="text-xs text-muted-foreground">
              {c.noteHint}
            </p>
            <FieldError id={`${ids}-err`} message={error} />
          </div>
          <TxFeedback state={tx.state} onRetry={() => void send()} />
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={tx.busy}>
              {c.cancel}
            </Button>
            <Button type="submit" variant="destructive" disabled={tx.busy}>
              {c.send}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Cancel an open bounty and refund the escrow to the poster. */
export function CancelDialog({
  bounty,
  open,
  onOpenChange,
  onDone,
}: {
  bounty: Bounty
  open: boolean
  onOpenChange: (o: boolean) => void
  onDone: () => void
}) {
  const { app, disclaimer, locale, labels } = useAppCopy()
  const c = app.bounty.cancel
  const tx = useTx()
  const amount = formatToken(bounty.reward, bounty.token, locale)

  async function send() {
    const ok = await tx.run(
      {
        title: t(app.summaries.cancel, { amount }),
        rows: [
          { label: app.summaries.cancelRows.bounty, value: bounty.title },
          { label: app.summaries.cancelRows.to, value: labels.you },
        ],
        movesValue: true,
      },
      (hash) => cancelBounty(bounty.id, hash)
    )
    if (ok) {
      toast.success(t(app.toasts.cancelled, { amount }))
      tx.reset()
      onOpenChange(false)
      onDone()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (tx.busy) return
        if (!o) tx.reset()
        onOpenChange(o)
      }}
    >
      <DialogContent closeLabel={app.close} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{c.title}</DialogTitle>
          <DialogDescription>{t(c.body, { amount })}</DialogDescription>
        </DialogHeader>
        <Disclaimer text={disclaimer} />
        <TxFeedback state={tx.state} onRetry={() => void send()} />
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={tx.busy}>
            {c.keep}
          </Button>
          <Button variant="destructive" onClick={() => void send()} disabled={tx.busy}>
            {c.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
