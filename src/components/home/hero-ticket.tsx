"use client"

import { CheckIcon, GitPullRequestIcon, LockIcon, UserRoundIcon } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"

import { WalletAvatar } from "@/components/ui/wallet"
import { cn } from "@/lib/utils"

const LEA = "0x3be1c0a9f27d4e58b6c2a1d09e7f45b8c3a2e61d"
const INES = "0x8f04d2b7e19c3a6f50d8e2c4b7a19f3e6d20c5a8"
/** Stage durations in ms: locked, submitted, approved, paid (held longer). */
const DURATIONS = [2200, 2200, 1600, 3600]

const reducedQuery = "(prefers-reduced-motion: reduce)"
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(reducedQuery)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false)
}

/**
 * Tracks an element's rendered height so a wrapper can transition to it:
 * `height: auto` can't be animated, a measured pixel height can.
 */
function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState<number>()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, height] as const
}

export interface HeroTicketCopy {
  label: string
  org: string
  title: string
  category: string
  difficulty: string
  reward: string
  escrow: string
  released: string
  contributor: string
  contributorRole: string
  submission: string
  steps: string[]
  approvedBy: string
  paid: string
  reputation: string
}

/**
 * Home hero: one bounty's whole life on a calm loop. The reward sits locked
 * on the ticket's stub, a submission arrives, it is approved, and the reward
 * travels to the contributor's wallet.
 */
export function HeroTicket({ copy }: { copy: HeroTicketCopy }) {
  const reduced = usePrefersReducedMotion()
  const [stage, setStage] = useState(3)

  useEffect(() => {
    if (reduced) return
    let current = 0
    let timer: ReturnType<typeof setTimeout>
    const next = () => {
      setStage(current)
      timer = setTimeout(() => {
        current = (current + 1) % DURATIONS.length
        next()
      }, DURATIONS[current])
    }
    const start = setTimeout(next, 400)
    return () => {
      clearTimeout(start)
      clearTimeout(timer)
    }
  }, [reduced])

  const shown = reduced ? 3 : stage
  const paid = shown === 3
  const [panelRef, panelHeight] = useMeasuredHeight<HTMLDivElement>()

  return (
    <figure className="relative mx-auto w-full max-w-xl">
      <figcaption className="sr-only">{copy.label}</figcaption>
      <div aria-hidden="true" className="overflow-hidden rounded-3xl border bg-card">
        {/* Ticket head: task left, reward stub right. */}
        <div className="flex">
          <div className="min-w-0 flex-1 p-5 sm:p-6">
            <p className="text-xs font-semibold text-muted-foreground">
              <span className="text-foreground">{copy.org}</span> · {copy.category} · {copy.difficulty}
            </p>
            <p className="mt-2 text-lg leading-snug font-bold text-balance sm:text-xl">{copy.title}</p>
          </div>
          <div className="flex w-32 shrink-0 flex-col items-end justify-center border-l-2 border-dashed p-5 text-right sm:w-40 sm:p-6">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[0.6875rem] font-bold tracking-wide uppercase transition-colors duration-200",
                paid ? "text-muted-foreground" : "text-primary-ink"
              )}
            >
              {paid ? <CheckIcon className="size-3" /> : <LockIcon className="size-3" />}
              {paid ? copy.released : copy.escrow}
            </span>
            <span className={cn("text-2xl font-extrabold tabular-nums transition-colors duration-200 sm:text-3xl", paid && "text-muted-foreground")}>
              {copy.reward.split(" ")[0]}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{copy.reward.split(" ").slice(1).join(" ")}</span>
          </div>
        </div>

        {/* Lifecycle rail. */}
        <ol className="grid grid-cols-4 border-t px-3 py-4 sm:px-5">
          {copy.steps.map((step, i) => {
            const done = i <= shown
            return (
              <li key={step} className="relative flex flex-col items-center gap-2 text-center">
                {i > 0 ? (
                  <span
                    className={cn(
                      "absolute top-3 right-1/2 z-0 h-0.5 w-full -translate-y-1/2 transition-colors duration-300",
                      done ? "bg-primary" : "bg-border"
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 flex size-6 items-center justify-center rounded-full border-2 transition-colors duration-200",
                    done ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"
                  )}
                >
                  {done ? <CheckIcon className="size-3.5" strokeWidth={3} /> : null}
                </span>
                <span className={cn("text-[0.6875rem] leading-tight font-semibold sm:text-xs", done ? "text-foreground" : "text-muted-foreground")}>{step}</span>
              </li>
            )
          })}
        </ol>

        {/* Who is doing the work, and what happened to it. The outer box eases
            to the inner box's measured height as the stages swap content. */}
        <div
          className="overflow-hidden border-t bg-muted/40 transition-[height] duration-300 ease-out motion-reduce:transition-none"
          style={{ height: panelHeight }}
        >
          <div ref={panelRef} className="p-5 sm:p-6">
            {shown === 0 ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex size-10 items-center justify-center rounded-full border-2 border-dashed border-input">
                  <UserRoundIcon className="size-4" />
                </span>
                <span className="h-2 w-40 rounded-full bg-border" />
              </div>
            ) : (
              <div key="contributor" className="tf-slide-in flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className={cn("rounded-full transition-shadow duration-200", paid && "ring-2 ring-primary ring-offset-2 ring-offset-muted")}>
                    <WalletAvatar address={LEA} size={40} />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="font-bold">{copy.contributor}</p>
                    <p className="truncate text-xs text-muted-foreground">{copy.contributorRole}</p>
                  </div>
                  {paid ? (
                    <span key="paid" className="tf-stamp text-right leading-tight">
                      <span className="block text-lg font-extrabold text-success tabular-nums">+{copy.reward}</span>
                      <span className="block text-xs font-bold text-primary-ink">{copy.reputation}</span>
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-card px-3 py-2.5 text-xs">
                  <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold">
                    <GitPullRequestIcon className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate">{copy.submission}</span>
                  </span>
                  {shown >= 2 ? (
                    <span key="approved" className="tf-stamp inline-flex items-center gap-1.5 font-bold text-success">
                      <WalletAvatar address={INES} size={16} />
                      {copy.approvedBy}
                    </span>
                  ) : null}
                </div>
                {/* The release line: escrow to wallet. */}
                <div className="relative h-1 overflow-hidden rounded-full bg-border">
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] ease-out",
                      paid ? "w-full duration-[900ms]" : "w-0 duration-0"
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </figure>
  )
}
