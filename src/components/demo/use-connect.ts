"use client"

import { useCallback } from "react"

import { connectWallet } from "@/lib/demo/wallet"

import { useAppCopy } from "./app-provider"

/** Connect the demo wallet through the simulated sign-in prompt. The header's wallet chip confirms it, so no toast. */
export function useConnect() {
  const { app } = useAppCopy()
  return useCallback(
    () =>
      connectWallet({
        title: app.summaries.signIn,
        rows: [{ label: app.summaries.signInRow, value: app.summaries.signInValue }],
        movesValue: false,
        noFee: true,
      }),
    [app]
  )
}
