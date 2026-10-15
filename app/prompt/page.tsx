"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Copy,
  Check,
  ArrowLeft,
  RotateCcw,
  Download,
  Terminal,
  FileCode,
  Database,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/step-indicator"
import { loadBriefOrSample } from "@/lib/store"
import { toast } from "sonner"
import type { ProjectBrief } from "@/lib/types"

const DataModelFlow = dynamic(() => import("./data-model-flow"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 flex items-center justify-center text-xs text-neutral-400">
      Initializing ERD Topology...
    </div>
  ),
})

type PromptMode = "master" | "database" | "api"

export default function PromptPage() {
  const router = useRouter()
  const [brief] = useState<ProjectBrief>(() => loadBriefOrSample())
  const [activeTab, setActiveTab] = useState<PromptMode>("master")
  const [copied, setCopied] = useState(false)

  const entities = brief?.dataModel ?? []

  function getPromptContent(mode: PromptMode): string {
    if (mode === "database") {
      return `/* ==========================================================================
   DATABASE SCHEMA SPECIFICATION & MIGRATIONS
   Project: ${brief.projectName || "Project"}
   ========================================================================== */

-- Core relational entities:
${brief.dataModel
  .map(
    (e) => `-- Entity: ${e.name}
CREATE TABLE "${e.name.toLowerCase()}" (
${e.fields.map((f) => `    "${f.name}" ${f.type}`).join(",\n")}
);`
  )
  .join("\n\n")}

-- Recommended Indexes:
${brief.dataModel
  .map((e) => `CREATE INDEX "idx_${e.name.toLowerCase()}_id" ON "${e.name.toLowerCase()}" ("id");`)
  .join("\n")}
`
    }

    if (mode === "api") {
      return `/* ==========================================================================
   API ROUTE HIERARCHY & CONTRACTS
   Project: ${brief.projectName || "Project"}
   ========================================================================== */

${brief.routes
  .map(
    (r) => `/**
 * Route: ${r.path}
 * Description: ${r.description}
 */
export async function ${r.path.includes("api") ? "POST" : "GET"}(req: Request) {
  // TODO: Validate incoming payload with Zod schema
  // TODO: Check user session / authentication
  // TODO: Execute transactional query
}
`
  )
  .join("\n")}
`
    }

    // Default Master prompt
    return brief.starterPrompt || `# PROJECT STARTER PROMPT: ${brief.projectName || "Application"}

## Summary
${brief.summary}

## Architecture
- Framework: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- Database: PostgreSQL with Drizzle ORM
- State & UI: Radix UI, Lucide React

## Relational Schema
${brief.dataModel.map((e) => `### ${e.name}\n${e.fields.map((f) => `- ${f.name}: ${f.type}`).join("\n")}`).join("\n\n")}

## Route Topology
${brief.routes.map((r) => `- \`${r.path}\`: ${r.description}`).join("\n")}

## Phased Implementation
${brief.buildPhases.map((p) => `### ${p.phase}\n${p.tasks.map((t) => `- [ ] ${t}`).join("\n")}`).join("\n\n")}
`
  }

  const currentPrompt = getPromptContent(activeTab)
  const charCount = currentPrompt.length
  const estimatedTokens = Math.round(charCount / 4)

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(currentPrompt)
      setCopied(true)
      toast.success("AI prompt copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy. Please select and copy manually.")
    }
  }

  function downloadPromptFile() {
    const filename =
      activeTab === "database"
        ? "schema.sql"
        : activeTab === "api"
        ? "routes.ts"
        : "CURSOR_RULES.md"

    const blob = new Blob([currentPrompt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      <StepIndicator />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Starter Prompt &amp; Topology
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Visual entity relationship topology and master coding prompts engineered for AI assistants.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs text-neutral-700 dark:text-neutral-300"
          >
            <Link href="/brief">
              <ArrowLeft className="size-3.5 mr-1.5" />
              Back to Brief
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs text-neutral-700 dark:text-neutral-300"
          >
            <Link href="/">
              <RotateCcw className="size-3.5 mr-1.5" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Visual ERD Topology */}
      {entities.length > 0 && <DataModelFlow entities={entities} />}

      {/* Prompt Workbench Studio */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        {/* Studio Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40">
          <div className="flex items-center gap-1.5 bg-neutral-200/70 dark:bg-neutral-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("master")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "master"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              <Terminal className="size-3.5" />
              Master Scaffold
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("database")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "database"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              <Database className="size-3.5" />
              SQL Schema
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("api")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === "api"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              <Layers className="size-3.5" />
              API Handlers
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="tabular-nums">{charCount.toLocaleString()} chars</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">~{estimatedTokens.toLocaleString()} tokens</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadPromptFile}
              className="h-8 text-xs text-neutral-700 dark:text-neutral-300"
            >
              <Download className="size-3.5 mr-1.5" />
              Download
            </Button>

            <Button
              size="sm"
              onClick={copyToClipboard}
              className="h-8 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5 mr-1.5" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Code Content Viewport */}
        <div className="p-4 sm:p-5">
          <pre className="relative overflow-auto rounded-lg bg-neutral-950 text-neutral-100 p-4 sm:p-5 text-xs sm:text-sm font-mono leading-relaxed max-h-[500px] border border-neutral-800 selection:bg-neutral-800">
            <code>{currentPrompt}</code>
          </pre>
        </div>

        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900 text-xs text-neutral-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            Compatible with Cursor, Claude Code, GitHub Copilot, Windsurf, and ChatGPT.
          </span>
          <span className="font-mono text-[11px] text-neutral-400">
            UTF-8 Plain Text
          </span>
        </div>
      </div>
    </div>
  )
}
