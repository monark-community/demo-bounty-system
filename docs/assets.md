# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (none are Unsplash+; each was downloaded from `images.unsplash.com`). They were resized to at most 1,800 px on the long edge, compressed, and are served from `public/images/` with `next/image`. Photographers are credited on `/credits`, linked from the footer.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/maintainer.jpg` | https://unsplash.com/photos/-ZZ7I31c0B8 | Anthony Riera | https://unsplash.com/@frenchriera | Home, "Who posts on TaskFlow": open-source maintainers; `/credits` |
| `public/images/challenge.jpg` | https://unsplash.com/photos/yYWOYeX-jLY | algoleague | https://unsplash.com/@algoleague | Home, "Who posts on TaskFlow": student challenges; `/credits` |
| `public/images/ambassadors.jpg` | https://unsplash.com/photos/rh4xapY-haI | Raka Rahmadani | https://unsplash.com/@rakarahmadani | Home, "Who posts on TaskFlow": ambassador programmes; `/credits` |

## Monark brand assets

From `lovable-migration/brand-refs/` and the [monark-community/website](https://github.com/monark-community/website) repo, used per `monark-brand-guidelines.md`:

| File | Source | Used for |
|-|-|-|
| `public/brand/monark-mark.svg`, `src/app/icon.svg` | brand-refs `logos/svg/standalone/logo-branded-standalone.svg` | Header pairing, favicon, wallet prompt, OG image |
| `public/brand/monark-horizontal-{light,dark}.svg` | website `public/vectors/brand/horizontal/` | Footer Monark band |
| `public/brand/monark-vertical-{light,dark}.svg` | brand-refs `logos/svg/vertical/` | 404 page |
| `public/brand/monark-mesh.svg` | website `public/vectors/decorative/monark-mesh.svg` | Home hero only (once per site) |
| `public/brand/socials/*.svg` | website `public/vectors/socials/` | Footer social links (recoloured to `foreground` through a CSS mask) |

## Built in code

- Bounty ticket (task + perforated reward stub): hero, board, home cards, composer preview, internal pricing card.
- Hero lifecycle ticket, escrow rail (lock / release / refund), validator vote tally, four-step rail (home), escrow and quorum diagrams (`/how-it-works`): flat orange line art in JSX/SVG, no gradients.
- Open Graph image: generated per locale with `next/og` (`src/app/[locale]/opengraph-image.tsx`).
- Icons: [Lucide](https://lucide.dev). Wallet avatars: Jazzicon via the `@monark/ui` `wallet` component.
- Type: Nunito Sans via `next/font/google`.
