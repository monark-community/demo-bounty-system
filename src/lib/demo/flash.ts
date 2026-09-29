"use client"

/**
 * One-shot hand-off between pages: the composer marks the bounty it just
 * published so the bounty page can play the "lock" animation once.
 */
let justPosted: string | null = null

export function markJustPosted(id: string) {
  justPosted = id
}

export function takeJustPosted(id: string): boolean {
  if (justPosted !== id) return false
  justPosted = null
  return true
}
