"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Check, ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { StepIndicator } from "@/components/step-indicator"
import { loadBrief } from "@/lib/store"
import { toast } from "sonner"
import type { ProjectBrief } from "@/lib/types"

const DataModelFlow = dynamic(() => import("./data-model-flow"), { ssr: false })

export default function PromptPage() {
  const router = useRouter()
  const [brief, setBrief] = useState<ProjectBrief | null>(() => {
    if (typeof window === "undefined") return null
    return loadBrief()
  })

  useEffect(() => {
    if (!brief) {
      router.replace("/")
    }
  }, [brief, router])

  const prompt = brief?.starterPrompt ?? ""
  const entities = brief?.dataModel ?? []
  const [copied, setCopied] = useState(false)

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      toast.success("Prompt copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy. Please select and copy manually.")
    }
  }

  if (!brief) return null

  return (
    <div className="space-y-6">
      <StepIndicator />

      <div className="text-center max-w-2xl mx-auto space-y-3 animate-fade-up stagger-1">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          Starter <span className="text-primary">Prompt</span>
        </h1>
        <p className="text-lg text-muted-foreground/70">
          Your project brief and data model, plus a copyable prompt for AI coding tools.
        </p>
      </div>

      {entities.length > 0 && (
        <div className="animate-fade-up stagger-2">
          <DataModelFlow entities={entities} />
        </div>
      )}

      <Card className="animate-fade-up stagger-3 border-border/40 shadow-lg hover:shadow-xl transition-all duration-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-3">
          <div>
            <CardTitle>AI Starter Prompt</CardTitle>
            <CardDescription>
              Give this prompt to Cursor, Claude, or any AI coding tool.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="shrink-0 transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="size-3.5 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1" /> Copy
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
            <pre className="relative overflow-auto rounded-2xl bg-muted/30 border border-border/30 p-6 text-sm leading-6 max-h-96 transition-all duration-300 hover:border-border/50">
            <code>{prompt}</code>
          </pre>
        </CardContent>
      </Card>

      <div className="flex justify-between animate-fade-up stagger-4">
        <Button variant="outline" onClick={() => router.push("/brief")} className="transition-all duration-300">
          <ArrowLeft className="size-4 mr-2" /> Back to Brief
        </Button>
        <Button variant="secondary" onClick={() => router.push("/")} className="transition-all duration-300">
          <RotateCcw className="size-4 mr-2" /> Start Over
        </Button>
      </div>
    </div>
  )
}
