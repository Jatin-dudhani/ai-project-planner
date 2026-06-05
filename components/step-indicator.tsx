"use client"

import { Suspense } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check } from "lucide-react"

const steps = [
  { href: "/", label: "Idea" },
  { href: "/brief", label: "Brief" },
  { href: "/prompt", label: "Prompt" },
]

function StepIndicatorInner() {
  const pathname = usePathname()
  const currentIndex = steps.findIndex((s) => s.href === pathname)

  return (
    <nav className="mb-8 animate-fade-up">
      <ol className="flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isFuture = index > currentIndex

          return (
            <li key={step.href} className="flex items-center" style={{ animationDelay: `${index * 80}ms` }}>
              <Link
                href={isCompleted ? step.href : "#"}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-all duration-500",
                  isActive && "text-primary",
                  isCompleted && "text-primary/70 hover:text-primary",
                  isFuture && "text-muted-foreground/40"
                )}
                onClick={(e) => {
                  if (isFuture) e.preventDefault()
                }}
              >
                <span
                  className={cn(
                    "relative flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-500",
                    isActive && "border-primary bg-primary text-primary-foreground animate-glow scale-110",
                    isCompleted && "border-primary/50 bg-primary/10 text-primary",
                    isFuture && "border-border/50 bg-transparent text-muted-foreground/40"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4 animate-scale-in" />
                  ) : (
                    <span className={cn(isActive && "animate-scale-in")}>{index + 1}</span>
                  )}
                </span>
                <span className={cn(
                  "hidden sm:inline transition-all duration-500",
                  isActive && "font-semibold",
                  isCompleted && "font-medium",
                  isFuture && "text-muted-foreground/40"
                )}>
                  {step.label}
                </span>
              </Link>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-0.5 w-10 sm:w-16 rounded-full transition-all duration-500",
                    isCompleted ? "bg-primary/40" : "bg-border/30"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function StepIndicator() {
  return (
    <Suspense fallback={<nav className="mb-8 animate-fade-up"><ol className="flex items-center justify-center gap-0" /></nav>}>
      <StepIndicatorInner />
    </Suspense>
  )
}
