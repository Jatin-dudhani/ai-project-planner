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
    <div className={cn("group relative rounded-lg border p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          {isEditing ? (
            <div className="space-y-2">
              {multiline ? (
                <textarea
                  className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
