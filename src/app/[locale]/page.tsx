import { ArrowRightIcon, GavelIcon, LockIcon, SendIcon, WalletIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Ticket } from "@/components/bounty/ticket"
import { ticketProps } from "@/components/bounty/ticket-props"
import { HeroTicket } from "@/components/home/hero-ticket"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { createSeed } from "@/lib/demo/seed"

import ambassadorsImg from "../../../public/images/ambassadors.jpg"
import challengeImg from "../../../public/images/challenge.jpg"
import maintainerImg from "../../../public/images/maintainer.jpg"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return pageMetadata(locale, "/", null, getDictionary(locale).meta.description)
}

const STEP_ICONS = [LockIcon, SendIcon, GavelIcon, WalletIcon]
const PHOTOS = [maintainerImg, challengeImg, ambassadorsImg]
const FEATURED = ["translate-governance-guide", "timesheet-timezone", "ambassador-walkthrough"]

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const h = dict.home
  // The same example data the demo seeds, rendered at build time.
  const seed = createSeed(dict.seed, locale)
  const featured = FEATURED.map((id) => seed.bounties.find((b) => b.id === id)).filter((b) => b !== undefined)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <Image
          src="/brand/monark-mesh.svg"
          alt=""
          width={569}
          height={571}
          unoptimized
          priority
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -right-48 w-[34rem] max-w-none opacity-[0.10] select-none sm:-right-32 lg:-top-24 lg:-right-24 lg:w-[48rem] dark:opacity-[0.16]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <h1 id="hero-title" className="text-[2.25rem] leading-[1.06] font-extrabold tracking-display sm:text-5xl lg:text-[3.75rem]">
              {h.title}
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg text-muted-foreground sm:text-xl">{h.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.ctaSecondary}</Link>
              </Button>
            </div>
          </div>
          <HeroTicket copy={h.ticket} />
        </div>
      </section>

      {/* Four steps */}
      <section aria-labelledby="steps-title" className="border-y bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 id="steps-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
              {h.steps.title}
            </h2>
            <Link
              href={href(locale, "/how-it-works")}
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary-ink underline underline-offset-4 md:min-h-0"
            >
              {h.steps.more}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
            {/* One flat orange line joining the four steps (vertical on phones). */}
            <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.375rem] w-0.5 bg-primary md:top-[1.375rem] md:right-[12.5%] md:bottom-auto md:left-[12.5%] md:h-0.5 md:w-auto" />
            {h.steps.items.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? LockIcon
              return (
                <li key={step.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                  <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground tabular-nums">0{i + 1}</p>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground md:mx-auto md:max-w-[15rem]">{step.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Open right now */}
      <section aria-labelledby="open-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 id="open-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.openNow.title}
        </h2>
        <ul className="mt-10 flex flex-col gap-3">
          {featured.map((b) => {
            const props = ticketProps(b, seed, dict.labels, dict.app.ticket, locale)
            return (
              <li key={b.id}>
                <Ticket {...props} deadline={undefined} flag={undefined} href={href(locale, `/app/bounty/${b.id}`)} />
              </li>
            )
          })}
        </ul>
        <Button asChild variant="outline" className="mt-6">
          <Link href={href(locale, "/app")}>
            {h.openNow.all}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <SectionDivider />

      {/* Who */}
      <section aria-labelledby="who-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 id="who-title" className="max-w-2xl text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.who.title}
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {h.who.items.map((item, i) => (
            <li key={item.title} className="flex flex-col overflow-hidden rounded-3xl border bg-card">
              <div className="relative aspect-[4/3]">
                <Image
                  src={PHOTOS[i] ?? maintainerImg}
                  alt={item.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="border-t bg-secondary/50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="faq-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.faq.title}
          </h2>
          <div className="mt-8 divide-y rounded-2xl border bg-card">
            {h.faq.items.map((item) => (
              <details key={item.q} className="group px-5 py-1">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-4 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section aria-labelledby="closing-title" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col gap-6 rounded-3xl border-2 border-primary bg-card p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <h2 id="closing-title" className="max-w-xl text-3xl font-bold tracking-display">
            {h.closing.title}
          </h2>
          <Button asChild size="lg" className="shrink-0">
            <Link href={href(locale, "/app/new")}>{h.closing.cta}</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
