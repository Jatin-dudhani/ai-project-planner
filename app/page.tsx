"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Database,
  Layers,
  FileCode,
  Compass,
  CheckCircle2,
  Copy,
  Check,
  Play,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StepIndicator } from "@/components/step-indicator"
import { saveBrief, SAMPLE_BRIEF } from "@/lib/store"
import { toast } from "sonner"
import type { ProjectBrief } from "@/lib/types"

const PRESETS = [
  {
    title: "Gamified Habit Tracker",
    description: "Daily wellness rituals, streak tracking, XP milestones, and heatmap analytics.",
    prompt:
      "A gamified habit tracking web application where users build daily and weekly routines, earn XP and level up for maintaining streaks, and view completion heatmaps with CSV/Markdown export.",
  },
  {
    title: "SaaS Team Subscription & Billing",
    description: "Multi-tenant workspace, role-based invites, Stripe billing, and audit logs.",
    prompt:
      "A multi-tenant B2B SaaS platform featuring team workspace management, role-based access control (Admin, Member, Viewer), automated Stripe subscription tiers, and an immutable audit log.",
  },
  {
    title: "Real-Time Collaborative Canvas",
    description: "Shared whiteboard, cursor presence, sticky notes, and export to PNG.",
    prompt:
      "A real-time multiplayer digital whiteboard supporting infinite panning, live cursor presence, sticky notes with markdown support, shape drawing, and PNG/SVG canvas export.",
  },
  {
    title: "AI Agent Workflow Orchestrator",
    description: "Chain LLM tasks, automated webhooks, token usage telemetry, and prompt testing.",
    prompt:
      "A developer console for orchestrating multi-step AI agent workflows with parallel execution nodes, automated retry queues, webhook triggers, and token budget telemetry.",
  },
]

export default function IdeaPage() {
  const router = useRouter()
  const [idea, setIdea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [generatedPlan, setGeneratedPlan] = useState<ProjectBrief | null>(null)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  async function handleGenerate(customText?: string) {
    let textToSubmit = (customText ?? idea).trim()

    if (!textToSubmit || textToSubmit.length < 5) {
      textToSubmit = PRESETS[0].prompt
      setIdea(textToSubmit)
      toast.info(`Using starter concept: "${PRESETS[0].title}"`)
    }

    setIsGenerating(true)
    setGenerationStep(1)

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 600)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: textToSubmit }),
      })

      if (!res.ok) {
        throw new Error("Generation request failed")
      }

      const brief: ProjectBrief = await res.json()
      saveBrief(brief)
      setGeneratedPlan(brief)
      toast.success("Project brief generated.")

      setTimeout(() => {
        try {
          router.push("/brief")
        } catch {
          window.location.href = "/brief"
        }
      }, 300)
    } catch (err) {
      console.warn("Using sample brief fallback:", err)
      saveBrief(SAMPLE_BRIEF)
      setGeneratedPlan(SAMPLE_BRIEF)
      toast.info("Generated brief using architecture template.")
      setTimeout(() => {
        try {
          router.push("/brief")
        } catch {
          window.location.href = "/brief"
        }
      }, 300)
    } finally {
      clearInterval(stepInterval)
      setIsGenerating(false)
      setGenerationStep(0)
    }
  }

  function handleLoadSample() {
    saveBrief(SAMPLE_BRIEF)
    setGeneratedPlan(SAMPLE_BRIEF)
    toast.success("Loaded demo project.")
    try {
      router.push("/brief")
    } catch {
      window.location.href = "/brief"
    }
  }

  function handleCopyPrompt(promptText: string) {
    navigator.clipboard.writeText(promptText)
    setCopiedPrompt(true)
    toast.success("Prompt copied.")
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-6">
      <StepIndicator />

      {/* Hero Header - Clean, Typographic & Minimalist */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <span>AI Architecture Engine</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span>Next.js 16</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 text-balance leading-tight">
          Turn any idea into a production blueprint
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-balance leading-relaxed">
          Formulate complete software specifications: relational schema, API routes, execution phases, and starter prompts for AI code editors.
        </p>
      </div>

      {/* Main Ideation Box - Crisp Zinc Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="idea-input" className="font-medium text-zinc-700 dark:text-zinc-300">
            Project Concept
          </label>
          <span className="font-mono text-zinc-400 dark:text-zinc-500">
            {idea.length} chars
          </span>
        </div>

        <Textarea
          id="idea-input"
          placeholder="Describe your project (e.g. A developer tool for uptime monitoring with automated webhook alerts and public incident status pages)..."
          className="min-h-32 text-sm resize-y font-sans border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 rounded-lg"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isGenerating) {
              e.preventDefault()
              handleGenerate()
            }
          }}
          disabled={isGenerating}
        />

        {isGenerating && (
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
              <Loader2 className="size-3.5 animate-spin text-zinc-600 dark:text-zinc-400" />
              <span>
                {generationStep === 1 && "Scoping technical requirements..."}
                {generationStep === 2 && "Synthesizing schema & routes..."}
                {generationStep >= 3 && "Formulating prompts & phases..."}
              </span>
            </div>
            <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500 rounded-full"
                style={{ width: `${(generationStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              disabled={isGenerating}
              className="text-xs text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full sm:w-auto"
            >
              <Compass className="size-3.5 mr-1.5 text-zinc-400" />
              Load Sample
            </Button>
            <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
              ⌘ + Enter
            </span>
          </div>

          <Button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="w-full sm:w-auto h-9 px-5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-colors rounded-lg shadow-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-2" />
                Architecting...
              </>
            ) : (
              <>
                Generate Specification
                <ArrowRight className="size-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Preview Banner (if generated) */}
      {generatedPlan && (
        <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/70 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-950 dark:text-zinc-100 text-xs font-semibold">
                <CheckCircle2 className="size-3.5 text-zinc-900 dark:text-zinc-100" />
                <span>Generated: {generatedPlan.projectName}</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {generatedPlan.summary}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyPrompt(generatedPlan.starterPrompt)}
                className="h-7 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {copiedPrompt ? <Check className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}
                {copiedPrompt ? "Copied" : "Copy"}
              </Button>
              <Button
                size="sm"
                asChild
                className="h-7 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950"
              >
                <Link href="/brief">
                  Open Brief
                  <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Archetypes - Clean Minimalist Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Presets &amp; Archetypes
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
            Click to load
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESETS.map((preset, idx) => (
            <div
              key={idx}
              className="group rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-4 transition-all hover:border-zinc-400 dark:hover:border-zinc-700 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {preset.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                    #{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  onClick={() => {
                    setIdea(preset.prompt)
                    toast.info(`Loaded: "${preset.title}"`)
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 text-[11px] px-2.5 font-medium ml-auto bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-colors"
                  onClick={() => handleGenerate(preset.prompt)}
                  disabled={isGenerating}
                >
                  <Play className="size-2.5 mr-1 fill-current" />
                  Generate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverable Pillars - Minimalist Monochromatic Layout */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs font-semibold">
              <Database className="size-3.5 text-zinc-500" />
              <span>Relational Schema</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Entities with typed attributes, primary keys, and foreign key relations.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs font-semibold">
              <Layers className="size-3.5 text-zinc-500" />
              <span>Route Contracts</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Mapped public routes, authenticated endpoints, and handler specifications.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 text-xs font-semibold">
              <FileCode className="size-3.5 text-zinc-500" />
              <span>AI Master Prompts</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Engineered instructions ready to paste directly into Cursor or Copilot.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
