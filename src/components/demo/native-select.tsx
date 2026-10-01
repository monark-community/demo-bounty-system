import { ChevronDownIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/**
 * A native select in the site's pill shape. The browser's own arrow ignores
 * padding and hugs the rounded edge, so it is hidden and drawn as an icon
 * inset from the curve instead.
 */
export function NativeSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <select
        {...props}
        className="h-full w-full cursor-pointer appearance-none rounded-full border border-input bg-background pr-9 pl-4 text-sm font-semibold"
      >
        {children}
      </select>
      <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  )
}
