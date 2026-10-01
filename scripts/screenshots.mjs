// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start -p 3137   (in another terminal)
//        BASE_URL=http://localhost:3137 pnpm screenshots
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

// Base URL: first argument, BASE_URL, or localhost:3000.
const BASE = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY // optional filter on "<locale>-<width>-<theme>"

const L = {
  en: {
    connect: "Connect demo wallet",
    confirm: "Confirm",
    reject: "Reject",
    menu: "Open menu",
    controls: "Demo controls",
    failNext: "Make the next transaction fail",
    post: "Post a bounty",
    publish: /^Lock .* and publish$/,
    submitWork: "Submit your work",
    sendWork: "Submit work",
    posterRejects: "Poster rejects",
    approvePay: "Approve and pay",
    rejectBtn: "Reject",
    rejectSend: "Reject with this reason",
    voteApprove: "Vote approve",
    criteria: "My work meets the acceptance criteria",
    link: "Link to your work",
    note: "Note for the reviewer",
    title: "Title",
    description: "Description",
    criteriaField: "Acceptance criteria",
    amount: "Reward",
    reason: "Reason",
    paidHeading: "Paid",
    board: "Bounty board",
    releasedTo: /^Released to /,
    quorumReached: "Quorum reached",
  },
  fr: {
    connect: "Connecter le portefeuille de démo",
    confirm: "Confirmer",
    reject: "Refuser",
    menu: "Ouvrir le menu",
    controls: "Réglages de la démo",
    failNext: "Faire échouer la prochaine transaction",
    post: "Publier une prime",
    publish: /^Bloquer .* et publier$/,
    submitWork: "Soumettre votre travail",
    sendWork: "Soumettre le travail",
    posterRejects: "L'auteur refuse",
    approvePay: "Approuver et payer",
    rejectBtn: "Refuser",
    rejectSend: "Refuser avec cette raison",
    voteApprove: "Voter pour",
    criteria: "Mon travail respecte les critères d'acceptation",
    link: "Lien vers votre travail",
    note: "Note pour l'évaluation",
    title: "Titre",
    description: "Description",
    criteriaField: "Critères d'acceptation",
    amount: "Récompense",
    reason: "Raison",
    paidHeading: "Payée",
    board: "Tableau des primes",
    releasedTo: /^Versé à /,
    quorumReached: "Quorum atteint",
  },
}

const widths = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme, full: true })
// French: home page and one key flow, both widths, light.
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light", full: false })

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: widths[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message))
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  const file = `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`
  if (fullPage) {
    // Walk down the page so lazy images load, then come back to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 60))
      }
      window.scrollTo(0, 0)
    })
  }
  await page.waitForTimeout(300)
  await page.screenshot({ path: file, fullPage })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const isMobile = (v) => v.w < 768
const t = (v) => L[v.locale]

async function confirmPrompt(page, v, capture, name) {
  const dialog = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: t(v).confirm, exact: true }) })
  await dialog.waitFor()
  if (capture) await shot(page, v, name)
  await dialog.getByRole("button", { name: t(v).confirm, exact: true }).click()
}

async function rejectPrompt(page, v) {
  const dialog = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: t(v).confirm, exact: true }) })
  await dialog.waitFor()
  await dialog.getByRole("button", { name: t(v).reject, exact: true }).click()
}

async function setFailNext(page, v) {
  await page.getByRole("button", { name: t(v).controls }).click()
  await page.getByRole("switch", { name: t(v).failNext }).click()
  await page.keyboard.press("Escape")
  await page.waitForTimeout(200)
}

async function connect(page, v, capture) {
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  const btn = page.getByRole("main").getByRole("button", { name: t(v).connect })
  await btn.waitFor()
  if (capture) {
    await shot(page, v, "app-01-board-guest", true)
    await btn.click()
    await rejectPrompt(page, v)
    await page.getByRole("main").getByRole("alert").first().waitFor()
    await shot(page, v, "flow1-connect-rejected")
  }
  await page.getByRole("main").getByRole("button", { name: t(v).connect }).click()
  await confirmPrompt(page, v, capture, "flow1-connect-prompt")
  await page.waitForFunction(() => {
    try {
      return JSON.parse(localStorage.getItem("taskflow-demo-v1") ?? "{}").wallet?.status === "connected"
    } catch {
      return false
    }
  }, null, { timeout: 10000 })
  await page.waitForTimeout(500)
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(600)
    await shot(page, v, `page-${name}`, true)
  }
  if (isMobile(v)) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: t(v).menu }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function flowPost(page, v) {
  await page.goto(`${BASE}/${v.locale}/app/new`, { waitUntil: "networkidle" })
  await page.getByLabel(t(v).title, { exact: true }).waitFor()
  await shot(page, v, "flow2-composer-blank", true)
  await page.getByRole("button", { name: t(v).publish }).click()
  await shot(page, v, "flow2-composer-errors", true)
  await page.getByLabel(t(v).title, { exact: true }).fill("Add keyboard shortcuts to the Kanban board")
  await page.getByLabel(t(v).description, { exact: true }).fill(
    "Power users move dozens of cards a day. Add shortcuts to move the focused card between columns and open it, with a help overlay listing them."
  )
  await page.getByLabel(t(v).criteriaField, { exact: true }).fill("Arrow keys move the focused card\nEnter opens it, Escape closes it\nA help overlay lists every shortcut")
  await page.getByLabel(t(v).amount, { exact: true }).fill("400")
  await shot(page, v, "flow2-composer-filled", true)
  // Failure first: the transaction reverts and the form stays filled.
  await setFailNext(page, v)
  await page.getByRole("button", { name: t(v).publish }).click()
  await confirmPrompt(page, v, true, "flow2-lock-prompt")
  await page.getByRole("alert").filter({ hasText: /./ }).last().waitFor({ timeout: 10000 })
  await page.waitForTimeout(300)
  await shot(page, v, "flow2-lock-failed", true)
  await page.getByRole("button", { name: t(v).publish }).click()
  await confirmPrompt(page, v, false)
  await page.waitForTimeout(500)
  await shot(page, v, "flow2-lock-pending")
  await page.waitForURL(/\/app\/bounty\//, { timeout: 15000 })
  await page.waitForTimeout(1200)
  await shot(page, v, "flow2-posted")
}

async function flowSubmit(page, v) {
  await page.goto(`${BASE}/${v.locale}/app/bounty/ambassador-walkthrough`, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  await shot(page, v, "flow3-visibility-locked", true)
  await page.goto(`${BASE}/${v.locale}/app/bounty/timesheet-timezone`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: t(v).submitWork }).click()
  const dialog = page.getByRole("dialog")
  await dialog.getByRole("button", { name: t(v).sendWork }).click()
  await shot(page, v, "flow3-submit-errors")
  await dialog.getByLabel(t(v).link).fill("https://github.com/monark-community/timesheet/pull/57")
  await dialog.getByLabel(t(v).note).fill("Exports now group by the member's own timezone. Added tests for 23:59, 00:01 and both DST switches.")
  await dialog.getByLabel(t(v).criteria).check()
  await dialog.getByRole("button", { name: t(v).sendWork }).click()
  await confirmPrompt(page, v, true, "flow3-submit-prompt")
  await page.waitForTimeout(400)
  await shot(page, v, "flow3-submit-pending")
  await page.getByRole("button", { name: t(v).posterRejects }).waitFor({ timeout: 15000 })
  await page.waitForTimeout(600)
  await shot(page, v, "flow3-submitted", true)
  await page.getByRole("button", { name: t(v).posterRejects }).click()
  await page.waitForTimeout(3500)
  await shot(page, v, "flow3-rejected-with-note", true)
}

async function flowReview(page, v) {
  await page.goto(`${BASE}/${v.locale}/app/bounty/trust-contacts-tests`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: t(v).approvePay }).first().waitFor()
  await shot(page, v, "flow4-review", true)
  // Reject Mei's submission with a reason.
  await page.getByRole("button", { name: t(v).rejectBtn, exact: true }).last().click()
  const dialog = page.getByRole("dialog")
  await dialog.getByLabel(t(v).reason).fill("The revoke tests are skipped, so revoking isn't covered yet. Please fix the fixture and enable them.")
  await dialog.getByRole("button", { name: t(v).rejectSend }).click()
  await confirmPrompt(page, v, false)
  await page.getByRole("button", { name: t(v).rejectSend }).waitFor({ state: "detached", timeout: 15000 })
  await page.waitForTimeout(800)
  await shot(page, v, "flow4-rejected", true)
  // Approve Priya: the release line draws from the escrow to her.
  await page.getByRole("button", { name: t(v).approvePay }).first().click()
  await confirmPrompt(page, v, true, "flow4-release-prompt")
  await page.waitForTimeout(400)
  await shot(page, v, "flow4-release-pending")
  await page.getByText(t(v).releasedTo).first().waitFor({ timeout: 15000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await shot(page, v, "flow4-released")
  await page.waitForTimeout(1200)
  await shot(page, v, "flow4-paid", true)
}

async function flowVote(page, v) {
  await page.goto(`${BASE}/${v.locale}/app/bounty/audit-escrow-release`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: t(v).voteApprove }).waitFor()
  await shot(page, v, "flow5-vote", true)
  await setFailNext(page, v)
  await page.getByRole("button", { name: t(v).voteApprove }).click()
  await confirmPrompt(page, v, false)
  await page.waitForTimeout(3500)
  await shot(page, v, "flow5-vote-failed", true)
  await page.getByRole("button", { name: t(v).voteApprove }).click()
  await confirmPrompt(page, v, true, "flow5-vote-prompt")
  await page.getByText(t(v).quorumReached).first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(1200)
  await shot(page, v, "flow5-quorum-paid", true)
}

async function run() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const v of variants) {
    const key = `${v.locale}-${v.w}-${v.theme}`
    if (ONLY && !key.includes(ONLY)) continue
    console.log(key)
    const { context, page } = await newPage(browser, v)
    if (v.full) {
      await marketing(page, v)
      await connect(page, v, true)
      await shot(page, v, "app-02-board", true)
      await flowPost(page, v)
      await flowSubmit(page, v)
      await flowReview(page, v)
      await flowVote(page, v)
      await page.goto(`${BASE}/${v.locale}/app/you`, { waitUntil: "networkidle" })
      await page.waitForTimeout(500)
      await shot(page, v, "app-03-your-work", true)
      await page.goto(`${BASE}/${v.locale}/app/leaderboard`, { waitUntil: "networkidle" })
      await page.waitForTimeout(500)
      await shot(page, v, "app-04-leaderboard", true)
    } else {
      await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
      await page.waitForTimeout(600)
      await shot(page, v, "page-home", true)
      await connect(page, v, false)
      await shot(page, v, "app-02-board", true)
      await flowReview(page, v)
    }
    await context.close()
  }
  await browser.close()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
