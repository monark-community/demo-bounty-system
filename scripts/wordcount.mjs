// Word counts per page (English), for the simplification pass.
// Usage: pnpm build && pnpm start -p 3137   (in another terminal)
//        node scripts/wordcount.mjs          (BASE_URL defaults to http://localhost:3137)
// Prints a Markdown table:
//   visible = words in <main> a visitor can read without opening anything (innerText)
//   total   = every word in <main>, including closed disclosures, FAQ answers, tooltips' text nodes
//   chrome  = visible words outside <main> (header, footer)
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3137"
const STORE = "taskflow-demo-v1"

async function measure(page) {
  return page.evaluate(() => {
    const main = document.querySelector("main")
    const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,-]*/gu) ?? []).length
    const all = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement?.closest("script,style,svg") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    })
    while (walker.nextNode()) all.push(walker.currentNode.nodeValue)
    const visible = words(main.innerText)
    const total = words(all.join(" "))
    const chrome = words(document.body.innerText) - visible
    return { visible, total, chrome }
  })
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-CA" })
const page = await context.newPage()
const rows = []

async function run(name, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(700)
  rows.push({ name, ...(await measure(page)) })
}

for (const [name, path] of [
  ["Home", "/en"],
  ["How it works", "/en/how-it-works"],
  ["Credits", "/en/credits"],
  ["404", "/en/this-page-does-not-exist"],
]) await run(name, path)

await run("App: board (guest)", "/en/app")
await page.getByRole("main").getByRole("button", { name: /connect/i }).first().click()
await page.getByRole("dialog").getByRole("button", { name: "Confirm", exact: true }).click()
await page.waitForFunction(
  (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "{}").wallet?.status === "connected"
    } catch {
      return false
    }
  },
  STORE,
  { timeout: 10000 }
)
await page.waitForTimeout(800)
rows.push({ name: "App: board (connected)", ...(await measure(page)) })

await run("App: bounty (open, submit)", "/en/app/bounty/timesheet-timezone")
await run("App: bounty (review yours)", "/en/app/bounty/trust-contacts-tests")
await run("App: bounty (validator vote)", "/en/app/bounty/audit-escrow-release")
await run("App: post a bounty", "/en/app/new")
await run("App: your work", "/en/app/you")
await run("App: leaderboard", "/en/app/leaderboard")

await browser.close()

const sum = (k) => rows.reduce((s, r) => s + r[k], 0)
console.log("| Page | Visible in main | Total in main (incl. collapsed) | Chrome (header, footer) |")
console.log("|-|-:|-:|-:|")
for (const r of rows) console.log(`| ${r.name} | ${r.visible} | ${r.total} | ${r.chrome} |`)
console.log(`| **Total** | **${sum("visible")}** | **${sum("total")}** | **${sum("chrome")}** |`)
