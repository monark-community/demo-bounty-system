import type { Metadata } from "next"

import { BountyView } from "@/components/bounty/bounty-view"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { SEED_BOUNTY_IDS } from "@/lib/demo/seed"
import { pageMetadata } from "@/lib/metadata"

// The example bounties are prerendered; bounties posted in the browser render on
// demand (the page is a client shell that reads the bounty from local demo state).
export function generateStaticParams() {
  return locales.flatMap((locale) => SEED_BOUNTY_IDS.map((id) => ({ locale, id })))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/app/bounty/[id]">): Promise<Metadata> {
  const { locale, id } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.bounty
  return { ...pageMetadata(locale, `/app/bounty/${id}`, m.title, m.description), robots: { index: false, follow: true } }
}

export default async function BountyPage({ params }: PageProps<"/[locale]/app/bounty/[id]">) {
  const { id } = await params
  return <BountyView id={id} />
}
