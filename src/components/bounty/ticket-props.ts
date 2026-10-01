import type { Dictionary } from "@/i18n"
import { t } from "@/i18n/t"
import type { Locale } from "@/i18n/config"
import { formatRelative, formatUnits, plural } from "@/lib/format"
import { displayStatus, personById } from "@/lib/demo/select"
import { TOKENS } from "@/lib/demo/tokens"
import type { Bounty, DemoState } from "@/lib/demo/types"

import type { TicketProps } from "./ticket"

/** Map a bounty to the presentational ticket, in the active language. */
export function ticketProps(
  b: Bounty,
  s: Pick<DemoState, "people" | "youId">,
  labels: Dictionary["labels"],
  copy: Dictionary["app"]["ticket"],
  locale: Locale,
  now = Date.now()
): TicketProps {
  const status = displayStatus(b, now)
  const winner = b.winnerSubmissionId ? b.submissions.find((x) => x.id === b.winnerSubmissionId) : undefined
  const winnerName = winner ? nameOf(s, winner.personId, labels.youInline) : ""
  const poster = nameOf(s, b.posterId, labels.youInline)
  const deadline =
    status === "paid"
      ? t(copy.paidTo, { name: winnerName })
      : status === "cancelled"
        ? t(copy.refunded, { name: poster })
        : t(status === "closed" ? copy.deadlinePassed : copy.deadlineIn, { relative: formatRelative(b.deadline, locale, now) })
  const flag =
    b.posterId === s.youId
      ? copy.yourBounty
      : b.submissions.some((x) => x.personId === s.youId && x.status === "review")
        ? copy.youSubmitted
        : undefined

  return {
    title: b.title,
    linkLabel: t(copy.open, { title: b.title }),
    org: b.org,
    category: labels.category[b.category],
    difficulty: labels.difficulty[b.difficulty],
    visibility: b.visibility,
    visibilityLabel: labels.visibilityShort[b.visibility],
    agents: b.agents,
    agentsLabel: labels.agents[b.agents],
    amount: formatUnits(b.reward, TOKENS[b.token].decimals, locale),
    token: b.token,
    stubLabel: status === "paid" ? labels.bountyStatus.paid : status === "cancelled" ? labels.bountyStatus.cancelled : copy.locked,
    status,
    statusLabel: labels.bountyStatus[status],
    deadline,
    submissions: plural(copy.submissions, b.submissions.length, locale),
    flag,
  }
}

export function nameOf(s: Pick<DemoState, "people" | "youId">, id: string, you: string): string {
  if (id === s.youId) return you
  return personById(s, id)?.name ?? id
}

/** "Relay, agent of Sofía Álvarez" for agents; the plain name for people. */
export function accountableName(s: Pick<DemoState, "people" | "youId">, id: string, you: string, labels: Dictionary["labels"]): string {
  const name = nameOf(s, id, you)
  const operatorId = personById(s, id)?.operatorId
  return operatorId ? t(labels.agentOf, { name, operator: nameOf(s, operatorId, you) }) : name
}
