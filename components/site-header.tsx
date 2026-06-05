import { Lightbulb } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/30">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/25 transition-all duration-500 group-hover:ring-primary/50 group-hover:scale-105 group-hover:animate-glow">
            <Lightbulb className="size-4.5 text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-6" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary via-primary/70 to-primary/40 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
            AI Planner
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
