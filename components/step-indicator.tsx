"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check } from "lucide-react"

const steps = [
  { href: "/", label: "Ideation", stepNumber: 1 },
  { href: "/brief", label: "Project Brief", stepNumber: 2 },
  { href: "/prompt", label: "Prompts & Schema", stepNumber: 3 },
]

function StepIndicatorInner() {
  const pathname = usePathname()
  const currentIndex = steps.findIndex((s) => s.href === pathname)

  return (
    <nav aria-label="Workflow Steps" className="mb-6">
      <ol className="flex items-center justify-center gap-1.5 sm:gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex

          return (
            <li key={step.href} className="flex items-center">
              <Link
                href={step.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium shadow-xs"
                    : isCompleted
                    ? "text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400"
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full text-[10px] font-mono ${
                    isActive
                      ? "bg-white/20 dark:bg-black/15 text-current font-bold"
                      : isCompleted
                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-600"
                  }`}
                >
                  {isCompleted ? <Check className="size-2.5 stroke-[2.5]" /> : step.stepNumber}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </Link>
              {index < steps.length - 1 && (
                <div
                  className={`mx-1 w-3 sm:w-6 h-px transition-colors ${
                    index < currentIndex
                      ? "bg-zinc-400 dark:bg-zinc-600"
                      : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
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
    <Suspense
      fallback={
        <nav className="mb-6 flex justify-center">
          <div className="h-7 w-56 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
        </nav>
      }
    >
      <StepIndicatorInner />
    </Suspense>
  )
}
