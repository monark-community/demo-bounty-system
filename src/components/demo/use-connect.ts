"use client"

import { useCallback } from "react"
import { toast } from "sonner"

import { connectWallet } from "@/lib/demo/wallet"

import { useAppCopy } from "./app-provider"

/** Connect the demo wallet through the simulated sign-in prompt. */
export function useConnect() {
  const { app } = useAppCopy()
  return useCallback(async () => {
    const ok = await connectWallet({
      title: app.summaries.signIn,
      rows: [{ label: app.summaries.signInRow, value: app.summaries.signInValue }],
      movesValue: false,
      noFee: true,
    })
    if (ok) toast.success(app.toasts.connected)
    return ok
  }, [app])
}
