"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { StepIndicator } from "@/components/step-indicator"
import { saveBrief } from "@/lib/store"
import { toast } from "sonner"
import type { ProjectBrief } from "@/lib/types"

export default function IdeaPage() {
  const router = useRouter()
  const [idea, setIdea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleGenerate() {
    if (!idea.trim() || idea.trim().length < 10) {
      toast.error("Please describe your app idea in more detail (at least 10 characters).")
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Generation failed" }))
        throw new Error(err.error || "Failed to generate brief")
      }

      const brief: ProjectBrief = await res.json()
      saveBrief(brief)
      toast.success("Project brief generated successfully!")
      router.push("/brief")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <StepIndicator />

      <div className="text-center space-y-3 animate-fade-up stagger-1">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          What&apos;s your
          <span className="block text-primary">app idea?</span>
        </h1>
        <p className="text-lg text-muted-foreground/70 max-w-md mx-auto">
          Describe your idea and let AI generate a structured project brief.
        </p>
      </div>

      <Card className="animate-fade-up stagger-2 border-border/40 shadow-lg hover:shadow-xl hover:border-border/60 transition-all duration-500">
        <CardHeader>
          <CardTitle>App Idea</CardTitle>
          <CardDescription>
            Be as specific as possible. Include what problem it solves, who it&apos;s for, and key features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., A habit tracking app that uses gamification to help users build daily routines..."
            className="min-h-36 text-base resize-y"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={isGenerating}
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || idea.trim().length < 10}
            className="w-full h-12 text-base font-semibold transition-all duration-300 active:scale-[0.95]"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-5 mr-2" />
                Generate Project Brief
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground/40 animate-fade-up stagger-3">
        Your idea is processed by AI. The generated brief is stored locally in your browser.
      </p>
    </div>
  )
}
