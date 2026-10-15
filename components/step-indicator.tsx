"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check } from "lucide-react"

const steps = [
  { href: "/", label: "Concept & Idea", stepNumber: 1 },
  { href: "/brief", label: "Project Brief", stepNumber: 2 },
  { href: "/prompt", label: "Starter Prompt & ERD", stepNumber: 3 },
]

function StepIndicatorInner() {
  const pathname = usePathname()
  const currentIndex = steps.findIndex((s) => s.href === pathname)

  return (
    <nav aria-label="Workflow Steps" className="mb-8">
      <ol className="flex items-center justify-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex

          return (
            <li key={step.href} className="flex items-center">
              <Link
                href={step.href}
                className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                <span
                  className={`flex size-4.5 items-center justify-center rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                      : isCompleted
                      ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {isCompleted ? <Check className="size-3" /> : step.stepNumber}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </Link>
              {index < steps.length - 1 && (
                <div className="mx-1 sm:mx-2 w-4 sm:w-8 h-px bg-neutral-200 dark:bg-neutral-800" />
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
        <nav className="mb-8 flex justify-center">
          <div className="h-8 w-64 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
        </nav>
      }
    >
      <StepIndicatorInner />
    </Suspense>
  )
}
