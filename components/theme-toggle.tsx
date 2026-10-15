"use client"

import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Sun, Moon, Monitor } from "lucide-react"

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <div
        className="flex items-center gap-0.5 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 h-8 w-[88px]"
        aria-hidden="true"
      />
    )
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
    { value: "dark", label: "Dark", icon: Moon },
  ] as const

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex items-center gap-0.5 p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
    >
      {themes.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} theme`}
            title={`Switch to ${label} theme`}
            onClick={() => setTheme(value)}
            className={`flex items-center justify-center size-7 rounded-[5px] transition-all ${
              isActive
                ? "bg-white text-zinc-950 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 font-medium"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            <Icon className="size-3.5" />
            <span className="sr-only">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
