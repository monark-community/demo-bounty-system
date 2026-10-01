import type { Metadata } from "next"

import { YourWork } from "@/components/demo/your-work"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/you">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.you
  return { ...pageMetadata(locale, "/app/you", m.title, m.description), robots: { index: false, follow: true } }
}

export default function YourWorkPage() {
  return <YourWork />
}
