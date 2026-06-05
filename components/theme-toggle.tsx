"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative rounded-full transition-all duration-500 hover:bg-accent/40 hover:scale-105 active:scale-95 overflow-hidden"
      aria-label="Toggle theme"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-180 dark:scale-0" />
      <Moon className="absolute size-4 rotate-180 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
