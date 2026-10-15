"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { clearBrief } from "@/lib/store"
import { toast } from "sonner"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()

  function handleReset() {
    clearBrief()
    toast.info("Workspace reset.")
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Brand wordmark - Clean & Minimal */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-mono text-[11px] font-bold">
            P
          </div>
          <span className="font-semibold tracking-tight">AI Project Planner</span>
        </Link>

        {/* Minimalist Segment Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium">
          <Link
            href="/"
            className={`px-3 py-1 rounded-md transition-all ${
              pathname === "/"
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            1. Ideate
          </Link>
          <Link
            href="/brief"
            className={`px-3 py-1 rounded-md transition-all ${
              pathname === "/brief"
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            2. Project Brief
          </Link>
          <Link
            href="/prompt"
            className={`px-3 py-1 rounded-md transition-all ${
              pathname === "/prompt"
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-xs font-semibold"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            3. Prompts &amp; Schema
          </Link>
        </nav>

        {/* Actions & Theme */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hidden sm:inline-flex"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset
          </Button>
        </div>
      </div>
    </header>
  )
}
