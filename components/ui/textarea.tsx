import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm shadow-xs transition-all duration-200 placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:bg-background/80",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
