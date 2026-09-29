import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "TaskFlow by Monark"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const mark = await readFile(join(process.cwd(), "public/brand/monark-mark.svg"), "utf8")
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`
  const tk = d.home.ticket

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF9F3", color: "#15110E", padding: 72, gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={64} height={64} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>TaskFlow</span>
              <span style={{ fontSize: 22, color: "#625952", marginTop: 6 }}>{d.common.byMonark}</span>
            </div>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: "#625952" }}>{d.common.demoBadge}</div>
        </div>
        {/* The bounty ticket: task on the left, locked reward on the stub. */}
        <div style={{ display: "flex", alignSelf: "center", width: 440, border: "3px solid #F88D10", borderRadius: 32, background: "#FFFEFC" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 28, gap: 12 }}>
            <span style={{ fontSize: 18, color: "#625952" }}>{tk.org}</span>
            <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>{tk.title}</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 150,
              borderLeft: "3px dashed #E9DFD7",
              padding: 20,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 800, color: "#B65000", letterSpacing: 1 }}>{tk.escrow.toUpperCase()}</span>
            <span style={{ fontSize: 44, fontWeight: 800 }}>300</span>
            <span style={{ fontSize: 18, color: "#625952" }}>tUSDC</span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
