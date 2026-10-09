"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { DemoChip } from "@/components/ui/demo-chip"
import { HeaderAction } from "@/components/ui/header-action"
import { LocaleSwitch } from "@/components/ui/locale-switch"
import { SiteBrand } from "@/components/ui/site-brand"
import { SiteHeader } from "@/components/ui/site-header"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { href, locales, switchLocalePath, type Locale } from "@/i18n/config"
import { useDemo } from "@/lib/demo/store"
import { connectWallet, disconnectWallet } from "@/lib/demo/wallet"

export interface HeaderCopy {
  product: string
  homeLabel: string
  nav: { label: string; overview: string; how: string; demo: string }
  menu: string
  closeMenu: string
  menuTitle: string
  demoChip: string
  demoBadge: string
  launchDemo: string
  theme: string
  language: { label: string; names: Record<Locale, string>; short: Record<Locale, string> }
  wallet: { connect: string; connecting: string; disconnect: string }
  signIn: { title: string; row: string; value: string }
}

/**
 * The standard Monark site header (@monark/ui site-header), wired to Next.js:
 * [mark] TaskFlow  links…   (• Demo) (EN|FR) (☾) [Launch demo | wallet]
 */
export function Header({ locale, copy }: { locale: Locale; copy: HeaderCopy }) {
  const pathname = usePathname() ?? `/${locale}`
  const demo = useDemo()

  return (
    <SiteHeader
      pathname={pathname}
      LinkComponent={Link}
      brand={<SiteBrand name={copy.product} href={href(locale)} aria-label={copy.homeLabel} LinkComponent={Link} />}
      links={[
        { href: href(locale), label: copy.nav.overview, exact: true },
        { href: href(locale, "/how-it-works"), label: copy.nav.how },
        { href: href(locale, "/app"), label: copy.nav.demo },
      ]}
      labels={{ nav: copy.nav.label, openMenu: copy.menu, closeMenu: copy.closeMenu, menu: copy.menuTitle }}
      actions={
        <>
          <DemoChip label={copy.demoChip} description={copy.demoBadge} />
          <LocaleSwitch
            locales={locales}
            current={locale}
            hrefFor={(l) => switchLocalePath(pathname, l)}
            labels={{ label: copy.language.label, names: copy.language.names, short: copy.language.short }}
            LinkComponent={Link}
            linkProps={{ prefetch: false }}
          />
          <ThemeToggle label={copy.theme} />
        </>
      }
      primaryAction={
        <HeaderAction
          appHref={href(locale, "/app")}
          pathname={pathname}
          launchLabel={copy.launchDemo}
          LinkComponent={Link}
          loading={!demo}
          wallet={{
            status: demo?.wallet.status,
            address: demo?.wallet.address,
            name: demo?.wallet.name,
            connectLabel: copy.wallet.connect,
            connectingLabel: copy.wallet.connecting,
            disconnectLabel: copy.wallet.disconnect,
            onConnect: () =>
              void connectWallet({
                title: copy.signIn.title,
                rows: [{ label: copy.signIn.row, value: copy.signIn.value }],
                movesValue: false,
                noFee: true,
              }),
            onDisconnect: disconnectWallet,
          }}
        />
      }
    />
  )
}
