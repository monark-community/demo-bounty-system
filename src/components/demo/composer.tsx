"use client"

import { BugIcon, FileTextIcon, LockIcon, ShieldIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useState, type ReactNode } from "react"

import { Ticket } from "@/components/bounty/ticket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { formatDate, formatRelative, formatToken, formatUnits, plural } from "@/lib/format"
import { useTx } from "@/lib/demo/chain"
import { markJustPosted } from "@/lib/demo/flash"
import { postBounty } from "@/lib/demo/ops"
import { COUNCIL } from "@/lib/demo/seed"
import { useDemo } from "@/lib/demo/store"
import { parseUnits, TOKEN_LIST, TOKENS } from "@/lib/demo/tokens"
import { CATEGORIES, DIFFICULTIES, REPUTATION, type Category, type Difficulty, type TokenSymbol, type Visibility } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { ConnectCard } from "./app-frame"
import { TxFeedback } from "./tx-feedback"

interface Draft {
  title: string
  description: string
  criteria: string
  category: Category
  difficulty: Difficulty
  skills: string
  amount: string
  token: TokenSymbol
  deadline: string
  visibility: Visibility
  review: "poster" | "validators"
  quorum: 2 | 3
}

const VISIBILITIES: Visibility[] = ["everyone", "members", "ambassadors"]
const MIN_REWARD: Record<TokenSymbol, string> = { tUSDC: "10", tDAI: "10", tETH: "0.005" }
const DAY = 86_400_000

function dateInput(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * DAY)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Local end of the chosen day, as ISO. */
function endOfDayIso(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 0, 0)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function Composer() {
  const { app, labels, seed, locale } = useAppCopy()
  const c = app.composer
  const f = c.fields
  const demo = useDemo()
  const router = useRouter()
  const tx = useTx()
  const uid = useId()
  const [showErrors, setShowErrors] = useState(false)
  const [now] = useState(() => Date.now())
  const [draft, setDraft] = useState<Draft>(() => ({
    title: "",
    description: "",
    criteria: "",
    category: "development",
    difficulty: "intermediate",
    skills: "",
    amount: "250",
    token: "tUSDC",
    deadline: dateInput(14),
    visibility: "everyone",
    review: "poster",
    quorum: 2,
  }))
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  if (!demo) return null
  const connected = demo.wallet.status === "connected"

  // ---- Validation --------------------------------------------------------
  const decimals = TOKENS[draft.token].decimals
  const reward = parseUnits(draft.amount, decimals)
  const balance = BigInt(demo.wallet.balances[draft.token])
  const min = parseUnits(MIN_REWARD[draft.token], decimals) ?? 0n
  const criteria = draft.criteria
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  const skills = draft.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const deadlineIso = endOfDayIso(draft.deadline)
  const deadlineMs = deadlineIso ? new Date(deadlineIso).getTime() : NaN
  const errors: Partial<Record<"title" | "description" | "criteria" | "skills" | "amount" | "deadline", string>> = {}
  if (draft.title.trim().length < 8 || draft.title.trim().length > 90) errors.title = c.errors.title
  if (draft.description.trim().length < 30 || draft.description.trim().length > 1200) errors.description = c.errors.description
  if (criteria.length < 1 || criteria.length > 8) errors.criteria = c.errors.criteria
  if (skills.length > 5) errors.skills = c.errors.skills
  if (reward === null || reward <= 0n) errors.amount = c.errors.amount
  else if (reward < min) errors.amount = t(c.errors.amountMin, { amount: formatToken(min, draft.token, locale) })
  else if (reward > balance) errors.amount = t(c.errors.balance, { amount: formatToken(balance, draft.token, locale) })
  if (!deadlineIso || deadlineMs < now + DAY * 0.5 || deadlineMs > now + 181 * DAY) errors.deadline = c.errors.deadline
  const errorCount = Object.keys(errors).length
  const shown = showErrors ? errors : {}
  const amountText = reward && reward > 0n ? formatToken(reward, draft.token, locale) : `0 ${draft.token}`

  function applyTemplate(key: keyof typeof c.templateItems) {
    const tpl = c.templateItems[key]
    setDraft((d) => ({
      ...d,
      title: tpl.title,
      description: tpl.description,
      category: key === "bug" ? "development" : key === "docs" ? "documentation" : "security",
      difficulty: key === "bug" ? "intermediate" : key === "docs" ? "beginner" : "expert",
      amount: key === "bug" ? "250" : key === "docs" ? "150" : "1500",
      token: "tUSDC",
      review: key === "audit" ? "validators" : "poster",
      visibility: key === "audit" ? "members" : "everyone",
    }))
  }

  async function publish() {
    setShowErrors(true)
    if (errorCount || !reward || !deadlineIso || !demo) {
      document.getElementById(`${uid}-summary`)?.focus()
      return
    }
    let newId = ""
    const ok = await tx.run(
      {
        title: t(app.summaries.lock, { amount: amountText }),
        rows: [
          { label: app.summaries.lockRows.bounty, value: draft.title.trim() },
          { label: app.summaries.lockRows.amount, value: amountText },
          { label: app.summaries.lockRows.deadline, value: formatDate(deadlineIso, locale) },
        ],
        movesValue: true,
      },
      (hash) => {
        newId = postBounty(
          {
            title: draft.title.trim(),
            description: draft.description.trim(),
            criteria,
            category: draft.category,
            difficulty: draft.difficulty,
            skills,
            token: draft.token,
            reward: reward.toString(),
            deadline: deadlineIso,
            visibility: draft.visibility,
            review: draft.review === "poster" ? { kind: "poster" } : { kind: "validators", validators: COUNCIL, quorum: draft.quorum },
            org: seed.orgs.core,
          },
          hash
        )
      }
    )
    if (ok && newId) {
      // The bounty page opens on the lock animation and the escrow panel: no toast.
      markJustPosted(newId)
      router.push(href(locale, `/app/bounty/${newId}`))
    }
  }

  const busy = tx.busy
  const templateIcons: Record<keyof typeof c.templateItems, ReactNode> = {
    bug: <BugIcon aria-hidden="true" />,
    docs: <FileTextIcon aria-hidden="true" />,
    audit: <ShieldIcon aria-hidden="true" />,
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{c.title}</h1>

      {!connected ? <ConnectCard /> : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void publish()
          }}
          className="flex min-w-0 flex-col gap-8"
        >
          <div>
            <p className="text-sm font-bold">{c.templates}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.keys(c.templateItems) as (keyof typeof c.templateItems)[]).map((key) => (
                <Button key={key} type="button" variant="outline" size="sm" onClick={() => applyTemplate(key)} disabled={busy}>
                  {templateIcons[key]}
                  {c.templateItems[key].name}
                </Button>
              ))}
            </div>
          </div>

          <Section title={c.sections.task}>
            <Field id={`${uid}-title`} label={f.title} hint={f.titleHint} error={shown.title}>
              <Input
                id={`${uid}-title`}
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={f.titlePlaceholder}
                maxLength={120}
                aria-invalid={!!shown.title}
                aria-describedby={`${uid}-title-hint ${uid}-title-err`}
              />
            </Field>
            <Field id={`${uid}-description`} label={f.description} hint={f.descriptionHint} error={shown.description}>
              <Textarea
                id={`${uid}-description`}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                aria-invalid={!!shown.description}
                aria-describedby={`${uid}-description-hint ${uid}-description-err`}
              />
            </Field>
            <Field id={`${uid}-criteria`} label={f.criteria} hint={f.criteriaHint} error={shown.criteria}>
              <Textarea
                id={`${uid}-criteria`}
                value={draft.criteria}
                onChange={(e) => set("criteria", e.target.value)}
                rows={4}
                placeholder={f.criteriaPlaceholder}
                aria-invalid={!!shown.criteria}
                aria-describedby={`${uid}-criteria-hint ${uid}-criteria-err`}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={`${uid}-category`} label={f.category}>
                <NativeSelect id={`${uid}-category`} value={draft.category} onChange={(v) => set("category", v as Category)}>
                  {CATEGORIES.map((x) => (
                    <option key={x} value={x}>
                      {labels.category[x]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field id={`${uid}-difficulty`} label={f.difficulty} hint={t(f.difficultyHint, { points: t(labels.points, { n: REPUTATION[draft.difficulty] }) })}>
                <NativeSelect
                  id={`${uid}-difficulty`}
                  value={draft.difficulty}
                  onChange={(v) => set("difficulty", v as Difficulty)}
                  describedBy={`${uid}-difficulty-hint`}
                >
                  {DIFFICULTIES.map((x) => (
                    <option key={x} value={x}>
                      {labels.difficulty[x]}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <Field id={`${uid}-skills`} label={f.skills} hint={f.skillsHint} error={shown.skills}>
              <Input
                id={`${uid}-skills`}
                value={draft.skills}
                onChange={(e) => set("skills", e.target.value)}
                placeholder={f.skillsPlaceholder}
                aria-invalid={!!shown.skills}
                aria-describedby={`${uid}-skills-hint ${uid}-skills-err`}
              />
            </Field>
          </Section>

          <Section title={c.sections.reward}>
            <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
              <Field
                id={`${uid}-amount`}
                label={f.amount}
                hint={t(f.balance, { amount: formatToken(balance, draft.token, locale) })}
                error={shown.amount}
              >
                <Input
                  id={`${uid}-amount`}
                  inputMode="decimal"
                  value={draft.amount}
                  onChange={(e) => set("amount", e.target.value)}
                  className="text-lg font-bold tabular-nums"
                  aria-invalid={!!shown.amount}
                  aria-describedby={`${uid}-amount-hint ${uid}-amount-err`}
                />
              </Field>
              <Field id={`${uid}-token`} label={f.token}>
                <NativeSelect id={`${uid}-token`} value={draft.token} onChange={(v) => set("token", v as TokenSymbol)}>
                  {TOKEN_LIST.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
            <Field id={`${uid}-deadline`} label={f.deadline} error={shown.deadline}>
              <Input
                id={`${uid}-deadline`}
                type="date"
                value={draft.deadline}
                min={dateInput(1)}
                max={dateInput(180)}
                onChange={(e) => set("deadline", e.target.value)}
                className="w-full sm:w-56"
                aria-invalid={!!shown.deadline}
                aria-describedby={`${uid}-deadline-err`}
              />
            </Field>
          </Section>

          <Section title={c.sections.rules}>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-bold">{f.visibility}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {VISIBILITIES.map((x) => (
                  <RadioCard key={x} name={`${uid}-vis`} checked={draft.visibility === x} onChange={() => set("visibility", x)} title={labels.visibility[x]} />
                ))}
              </div>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-bold">{f.review}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <RadioCard
                  name={`${uid}-review`}
                  checked={draft.review === "poster"}
                  onChange={() => set("review", "poster")}
                  title={f.reviewPoster}
                  body={f.reviewPosterHint}
                />
                <RadioCard
                  name={`${uid}-review`}
                  checked={draft.review === "validators"}
                  onChange={() => set("review", "validators")}
                  title={f.reviewValidators}
                  body={f.reviewValidatorsHint}
                />
              </div>
              {draft.review === "validators" ? (
                <div className="mt-2 flex flex-col gap-2 rounded-2xl border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm">{f.council}</p>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${uid}-quorum`} className="text-sm font-bold">
                      {f.quorum}
                    </Label>
                    <NativeSelect id={`${uid}-quorum`} value={String(draft.quorum)} onChange={(v) => set("quorum", v === "3" ? 3 : 2)}>
                      {[2, 3].map((n) => (
                        <option key={n} value={n}>
                          {t(f.quorumOption, { n })}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
              ) : null}
            </fieldset>
          </Section>

          <div className="flex flex-col gap-4 rounded-2xl border-2 border-primary/60 bg-card p-4 sm:p-5">
            {showErrors && errorCount ? (
              <p id={`${uid}-summary`} tabIndex={-1} role="alert" className="text-sm font-bold text-destructive outline-none">
                {plural(c.summary, errorCount, locale)}
              </p>
            ) : (
              <span id={`${uid}-summary`} tabIndex={-1} className="sr-only" />
            )}
            <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start" disabled={busy || !connected}>
              <LockIcon aria-hidden="true" />
              {busy ? c.publishing : t(c.publish, { amount: amountText })}
            </Button>
            <TxFeedback state={tx.state} pendingLabel={c.publishing} onRetry={() => void publish()} onDismiss={() => tx.reset()} />
          </div>
        </form>

        <aside aria-labelledby={`${uid}-preview`} className="flex flex-col gap-3 lg:sticky lg:top-24">
          <h2 id={`${uid}-preview`} className="eyebrow text-muted-foreground">
            {c.preview}
          </h2>
          <Ticket
            title={draft.title.trim() || c.previewTitle}
            org={seed.orgs.core}
            category={labels.category[draft.category]}
            difficulty={labels.difficulty[draft.difficulty]}
            visibility={draft.visibility}
            visibilityLabel={labels.visibilityShort[draft.visibility]}
            amount={reward && reward > 0n ? formatUnits(reward, decimals, locale) : "0"}
            token={draft.token}
            stubLabel={app.ticket.locked}
            status="open"
            statusLabel={labels.bountyStatus.open}
            deadline={deadlineIso && !errors.deadline ? t(app.ticket.deadlineIn, { relative: formatRelative(deadlineIso, locale) }) : undefined}
            submissions={plural(app.ticket.submissions, 0, locale)}
            flag={app.ticket.yourBounty}
            as="h3"
            compact
            className={cn(busy && "border-dashed border-primary")}
          />
        </aside>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border bg-card p-4 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  )
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="font-bold">
        {label}
      </Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="text-sm font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function NativeSelect({
  id,
  value,
  onChange,
  describedBy,
  children,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  describedBy?: string
  children: ReactNode
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-describedby={describedBy}
      className="h-10 w-full rounded-full border border-input bg-background px-4 text-sm font-semibold"
    >
      {children}
    </select>
  )
}

function RadioCard({ name, checked, onChange, title, body }: { name: string; checked: boolean; onChange: () => void; title: string; body?: string }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        checked ? "border-primary bg-secondary/60" : "hover:border-input"
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-1 size-4 accent-[var(--primary)]" />
      <span className="text-sm">
        <span className="block font-bold">{title}</span>
        {body ? <span className="mt-0.5 block text-xs text-muted-foreground">{body}</span> : null}
      </span>
    </label>
  )
}
