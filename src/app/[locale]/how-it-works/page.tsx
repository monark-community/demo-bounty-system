import { ArrowRightIcon, CheckIcon, GavelIcon, MegaphoneIcon, MessageSquareWarningIcon, ShieldIcon, UndoIcon, UsersIcon, VoteIcon, GlobeIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { EscrowDiagram } from "@/components/diagrams/escrow-diagram"
import { QuorumDiagram } from "@/components/diagrams/quorum-diagram"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { DIFFICULTIES, REPUTATION } from "@/lib/demo/types"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.how
  return pageMetadata(locale, "/how-it-works", m.title, m.description)
}

const INTERFACE = `// TaskFlow bounty escrow (simplified)
function post(token, reward, deadline, visibility, review) returns (bountyId);
function submit(bountyId, workUri) returns (submissionId);   // before deadline, role-gated

// Poster review
function approve(bountyId, submissionId);                   // pays the winner in the same call
function reject(bountyId, submissionId, string reason);     // reason is required

// Validator review
function vote(bountyId, submissionId, bool approve, string reason);
// when approvals >= quorum: pays the winner in the same call

function cancel(bountyId);   // only with no submission awaiting a decision; refunds the poster

event Posted(bountyId, poster, reward);
event Submitted(bountyId, submissionId, contributor);
event Voted(bountyId, submissionId, validator, approve);
event Paid(bountyId, contributor, amount);
event Cancelled(bountyId, refund);`

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.how
  const rejectIcons = [MessageSquareWarningIcon, MegaphoneIcon, UndoIcon]
  const visIcons = [GlobeIcon, UsersIcon, ShieldIcon]

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-12 sm:px-6 lg:pt-16">
        <p className="eyebrow text-primary-ink">{h.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-display sm:text-5xl">{h.title}</h1>
        <p className="mt-5 max-w-[62ch] text-lg text-muted-foreground">{h.intro}</p>
      </section>

      <section aria-labelledby="escrow-title" className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <h2 id="escrow-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.escrow.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{h.escrow.body}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {h.escrow.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <CheckIcon className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <EscrowDiagram labels={h.escrow.diagram} />
      </section>

      <SectionDivider />

      <section aria-labelledby="decide-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="decide-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.decide.title}
        </h2>
        <p className="mt-4 max-w-[62ch] text-muted-foreground">{h.decide.body}</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-4">
            {[
              { icon: GavelIcon, ...h.decide.poster },
              { icon: VoteIcon, ...h.decide.validators },
            ].map((m) => (
              <article key={m.title} className="rounded-3xl border bg-card p-6">
                <m.icon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{m.title}</h3>
                <p className="mt-2 text-muted-foreground">{m.body}</p>
                <p className="mt-3 text-sm font-semibold">{m.best}</p>
              </article>
            ))}
          </div>
          <QuorumDiagram labels={h.decide.diagram} />
        </div>
      </section>

      <section aria-labelledby="reject-title" className="border-y bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="reject-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.reject.title}
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {h.reject.items.map((item, i) => {
              const Icon = rejectIcons[i] ?? UndoIcon
              return (
                <li key={item.title}>
                  <Icon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.body}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <section aria-labelledby="vis-title">
          <h2 id="vis-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.visibility.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{h.visibility.body}</p>
          <ul className="mt-6 flex flex-col gap-3">
            {h.visibility.items.map((item, i) => {
              const Icon = visIcons[i] ?? GlobeIcon
              return (
                <li key={item.title} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  <span>
                    <span className="block font-bold">{item.title}</span>
                    <span className="block text-sm text-muted-foreground">{item.body}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
        <section aria-labelledby="rep-title">
          <h2 id="rep-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.reputation.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{h.reputation.body}</p>
          <table className="mt-6 w-full overflow-hidden rounded-2xl border bg-card text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {h.reputation.table.difficulty}
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  {h.reputation.table.points}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {DIFFICULTIES.map((d) => (
                <tr key={d}>
                  <td className="px-4 py-3">{dict.labels.difficulty[d]}</td>
                  <td className="px-4 py-3 text-right font-extrabold tabular-nums">+{REPUTATION[d]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <SectionDivider />

      <section aria-labelledby="devs-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="devs-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.devs.title}
        </h2>
        <p className="mt-4 max-w-[68ch] text-muted-foreground">{h.devs.body}</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <figure className="min-w-0">
            <figcaption className="text-sm font-bold">{h.devs.codeLabel}</figcaption>
            <pre className="mt-3 overflow-x-auto rounded-2xl border bg-card p-4 font-mono text-xs leading-relaxed">
              <code>{INTERFACE}</code>
            </pre>
          </figure>
          <div className="flex flex-col gap-4">
            <ul className="flex flex-col divide-y rounded-2xl border bg-card">
              {h.devs.files.map((f) => (
                <li key={f.file} className="flex flex-col gap-0.5 px-4 py-3">
                  <code className="font-mono text-xs font-bold text-primary-ink">src/lib/demo/{f.file}</code>
                  <span className="text-sm text-muted-foreground">{f.note}</span>
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {h.devs.notes.map((n) => (
                <li key={n} className="flex items-start gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-title" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col gap-6 rounded-3xl border-2 border-primary bg-card p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="cta-title" className="text-3xl font-bold tracking-display">
              {h.cta.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{h.cta.body}</p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href={href(locale, "/app")}>
              {h.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
