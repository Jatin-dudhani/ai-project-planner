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
        className="flex items-center gap-0.5 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900 h-8 w-[88px]"
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
      className="flex items-center gap-0.5 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900"
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
            className={`flex items-center justify-center size-7 rounded-md transition-all ${
              isActive
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100 font-medium"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
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
