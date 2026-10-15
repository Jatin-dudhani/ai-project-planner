"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Sparkles, RotateCcw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { clearBrief } from "@/lib/store"
import { toast } from "sonner"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()

  function handleReset() {
    clearBrief()
    toast.info("Started a fresh project workspace.")
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-mono text-xs font-semibold">
            AP
          </span>
          <span>AI Project Planner</span>
        </Link>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <Link
            href="/"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              pathname === "/" ? "text-neutral-900 dark:text-neutral-100 font-semibold" : ""
            }`}
          >
            Concept
          </Link>
          <Link
            href="/brief"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              pathname === "/brief" ? "text-neutral-900 dark:text-neutral-100 font-semibold" : ""
            }`}
          >
            Project Brief
          </Link>
          <Link
            href="/prompt"
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              pathname === "/prompt" ? "text-neutral-900 dark:text-neutral-100 font-semibold" : ""
            }`}
          >
            Prompt &amp; Topology
          </Link>
        </nav>

        {/* Zone 3: Primary Action & Theme */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs font-medium whitespace-nowrap shrink-0 hidden sm:inline-flex"
          >
            <Link href="/" onClick={handleReset}>
              <RotateCcw className="size-3.5 mr-1.5" />
              New Project
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
