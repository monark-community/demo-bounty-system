"use client"

import { Loader2Icon, PlusIcon, WalletIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { toast } from "sonner"

import { AppLoading } from "@/components/ui/app-loading"
import { AppTabs } from "@/components/ui/app-tabs"
import { Button } from "@/components/ui/button"
import { DemoControls, DemoControlsToggle } from "@/components/ui/demo-controls"
import { href } from "@/i18n/config"
import { setAmbassador } from "@/lib/demo/ops"
import { waitingOnYou } from "@/lib/demo/select"
import { resetDemo, setSettings, useDemo, useStorageOk } from "@/lib/demo/store"
import { NETWORK_NAME } from "@/lib/demo/tokens"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { useConnect } from "./use-connect"

/**
 * App chrome under the site header: ONE compact bar with the board's sections
 * on the left, and the network + demo controls pill and "Post a bounty" on the
 * right. No testnet strip: that line lives in the wallet prompt, once per
 * transaction (brand guidelines §8 "Restraint", §11).
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app } = useAppCopy()

  return (
    <div className="flex flex-1 flex-col">
      <AppBar />
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-warning sm:px-6">
          {app.storageError}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} /> : children}
      </div>
    </div>
  )
}

function AppBar() {
  const { app, seed, locale } = useAppCopy()
  const demo = useDemo()
  const pathname = usePathname() ?? ""
  const n = app.nav
  const c = app.controls
  const ambassador = demo?.people.find((p) => p.id === demo.youId)?.roles.includes("ambassador") ?? false
  const base = href(locale, "/app")
  const waiting = demo && demo.wallet.status === "connected" ? waitingOnYou(demo).reduce((sum, w) => sum + w.count, 0) : 0
  const postActive = pathname.startsWith(`${base}/new`)

  return (
    <AppTabs
      label={n.label}
      pathname={pathname}
      LinkComponent={Link}
      tabs={[
        // The board tab also owns the bounty pages.
        { href: base, label: n.board, active: pathname === base || pathname.startsWith(`${base}/bounty`) },
        { href: `${base}/you`, label: n.you, count: waiting },
        { href: `${base}/leaderboard`, label: n.leaderboard },
      ]}
      actions={
        <>
          {demo ? (
            <DemoControls
              networkName={NETWORK_NAME}
              slow={demo.settings.slow}
              onSlowChange={(v) => setSettings({ slow: v })}
              failNext={demo.settings.failNext}
              onFailNextChange={(v) => setSettings({ failNext: v })}
              onReset={() => {
                resetDemo(seed, locale)
                toast.success(c.resetDone)
              }}
              title={c.title}
              openLabel={c.open}
              slowLabel={c.slow}
              slowHint={c.slowHint}
              failNextLabel={c.failNext}
              failNextHint={c.failNextHint}
              resetLabel={c.reset}
              resetHint={c.resetHint}
              resetConfirmTitle={c.resetConfirm}
              resetConfirmBody={c.resetConfirmBody}
              resetConfirmLabel={c.resetDo}
              cancelLabel={c.cancel}
              closeLabel={app.close}
            >
              <DemoControlsToggle label={c.ambassador} hint={c.ambassadorHint} checked={ambassador} onCheckedChange={(v) => setAmbassador(v)} />
            </DemoControls>
          ) : null}
          {!postActive ? (
            <Button asChild size="sm" className="px-2.5 sm:px-3">
              <Link href={`${base}/new`}>
                <PlusIcon aria-hidden="true" />
                <span className="hidden sm:inline">{n.post}</span>
                <span className="sr-only sm:hidden">{n.post}</span>
              </Link>
            </Button>
          ) : null}
        </>
      }
    />
  )
}

/** Inline invitation to connect, used wherever an action needs a wallet: one line and the button. */
export function ConnectCard({ className, compact = false }: { className?: string; compact?: boolean }) {
  const demo = useDemo()
  const { app } = useAppCopy()
  const connect = useConnect()
  const g = app.connectCard
  const connecting = demo?.wallet.status === "connecting"
  const rejected = demo?.wallet.lastError === "rejected"

  return (
    <section aria-label={g.title} className={cn("flex flex-col gap-3 rounded-2xl border border-dashed bg-card p-4 sm:p-5", className)}>
      {!compact ? <h2 className="font-bold">{g.title}</h2> : null}
      <Button className="self-start" disabled={connecting} onClick={() => void connect()}>
        {connecting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
        {connecting ? app.wallet.connecting : g.button}
      </Button>
      <div aria-live="polite">
        {rejected ? (
          <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
            <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {g.rejected}
          </p>
        ) : null}
      </div>
    </section>
  )
}
