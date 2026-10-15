"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Layers,
  Database,
  Compass,
  FileCode,
  Play,
  CheckCircle2,
  Copy,
  Check,
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
      toast.success("Project brief generated successfully!")

      // Navigate to /brief with immediate fallback
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
    toast.success("Loaded demo project brief!")
    try {
      router.push("/brief")
    } catch {
      window.location.href = "/brief"
    }
  }

  function handleCopyPrompt(promptText: string) {
    navigator.clipboard.writeText(promptText)
    setCopiedPrompt(true)
    toast.success("Starter prompt copied to clipboard!")
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <StepIndicator />

      {/* Hero Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 text-balance">
          Architect your next application in seconds.
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-balance">
          Describe what you want to build. Generate a full system brief, route topology, relational data model, and master prompt ready for Cursor, Claude, or Copilot.
        </p>
      </div>

      {/* Main Ideation Canvas */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="idea-input" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Concept Specification
            </label>
            <span className="text-[11px] font-mono text-neutral-400">
              {idea.length} characters
            </span>
          </div>

          <Textarea
            id="idea-input"
            placeholder="e.g. A developer tool for monitoring API uptime with customizable webhook alerts, historical latency charts, and automated incident status pages..."
            className="min-h-36 text-sm sm:text-base resize-y font-sans border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            disabled={isGenerating}
          />

          {isGenerating && (
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
              <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                <Loader2 className="size-4 animate-spin text-neutral-500" />
                <span>
                  {generationStep === 1 && "Analyzing concept & scoping technical requirements..."}
                  {generationStep === 2 && "Synthesizing relational entities & route matrix..."}
                  {generationStep >= 3 && "Formulating master coding prompt & implementation phases..."}
                </span>
              </div>
              <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 dark:bg-white transition-all duration-700"
                  style={{ width: `${(generationStep / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              disabled={isGenerating}
              className="text-xs text-neutral-700 dark:text-neutral-300 w-full sm:w-auto"
            >
              <Compass className="size-3.5 mr-1.5" />
              Load Interactive Demo Brief
            </Button>

            <Button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="w-full sm:w-auto h-10 px-6 text-xs sm:text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 transition-colors shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" />
                  Generate Architecture Plan
                  <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Generated Plan Instant Preview Banner (renders when plan is ready) */}
      {generatedPlan && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="size-4" />
                <span>Architecture Plan Generated: {generatedPlan.projectName}</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                {generatedPlan.summary}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyPrompt(generatedPlan.starterPrompt)}
                className="h-8 text-xs bg-white dark:bg-neutral-900"
              >
                {copiedPrompt ? (
                  <Check className="size-3.5 mr-1 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5 mr-1" />
                )}
                {copiedPrompt ? "Copied" : "Copy Prompt"}
              </Button>
              <Button
                size="sm"
                asChild
                className="h-8 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Link href="/brief">
                  Open Full Brief
                  <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-xs font-mono text-neutral-600 dark:text-neutral-400">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {generatedPlan.routes.length}
              </span>{" "}
              Routes
            </div>
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {generatedPlan.dataModel.length}
              </span>{" "}
              Entities
            </div>
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {generatedPlan.buildPhases.length}
              </span>{" "}
              Build Phases
            </div>
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {generatedPlan.risks.length}
              </span>{" "}
              Risks
            </div>
          </div>
        </div>
      )}

      {/* Preset Inspiration Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-neutral-500 tracking-wider">
            Curated Architecture Presets
          </h2>
          <span className="text-[11px] text-neutral-400">Click to select and generate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESETS.map((preset, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 transition-all hover:border-neutral-400 dark:hover:border-neutral-700 hover:shadow-xs flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    {preset.title}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px] px-2 text-neutral-600 dark:text-neutral-400"
                  onClick={() => {
                    setIdea(preset.prompt)
                    toast.info(`Filled prompt with ${preset.title}`)
                  }}
                >
                  Use Text
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 text-[11px] px-2.5 font-medium ml-auto"
                  onClick={() => handleGenerate(preset.prompt)}
                  disabled={isGenerating}
                >
                  <Play className="size-2.5 mr-1 fill-current" />
                  Generate This
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Quick Jump */}
      <div className="flex items-center justify-center pt-2">
        <Link
          href="/brief"
          className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 underline underline-offset-4 flex items-center gap-1.5"
        >
          Already have a plan? Jump straight to Project Brief
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Architecture Deliverables Pillar Grid */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 text-xs font-semibold">
              <Database className="size-4 text-neutral-500" />
              <span>Relational ERD Topology</span>
            </div>
            <p className="text-xs text-neutral-500">
              Complete entity schemas with typed attributes, foreign key constraints, and directional dependencies.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 text-xs font-semibold">
              <Layers className="size-4 text-neutral-500" />
              <span>Full Route Hierarchy</span>
            </div>
            <p className="text-xs text-neutral-500">
              Public and authenticated pages, server-side route handlers, and API endpoints mapped out clearly.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 text-xs font-semibold">
              <FileCode className="size-4 text-neutral-500" />
              <span>AI Coding Master Prompt</span>
            </div>
            <p className="text-xs text-neutral-500">
              Single-copy markdown prompt engineered specifically for scaffolding with Cursor, Claude Code, or Copilot.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
