"use client"

import { useState } from "react"
import { Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EditableSectionProps {
  title: string
  initialValue: string
  onSave: (value: string) => void
  multiline?: boolean
  className?: string
}

export function EditableSection({
  title,
  initialValue,
  onSave,
  multiline = false,
  className,
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)

  function handleSave() {
    onSave(value)
    setIsEditing(false)
  }

  function handleCancel() {
    setValue(initialValue)
    setIsEditing(false)
  }

  return (
    <div className={cn("group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h4>
          {isEditing ? (
            <div className="space-y-2">
              {multiline ? (
                <textarea
                  className="flex min-h-20 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-white"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoFocus
                />
              ) : (
                <Input value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Check className="size-3.5 mr-1" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  <X className="size-3.5 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm">{value}</p>
          )}
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
