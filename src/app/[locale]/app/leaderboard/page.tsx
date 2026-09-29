import type { Metadata } from "next"

import { Leaderboard } from "@/components/demo/leaderboard"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/leaderboard">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.leaderboard
  return pageMetadata(locale, "/app/leaderboard", m.title, m.description)
}

export default function LeaderboardPage() {
  return <Leaderboard />
}
