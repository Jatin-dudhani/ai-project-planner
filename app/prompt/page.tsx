"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import Link from "next/link"
import {
  Copy,
  Check,
  ArrowLeft,
  RotateCcw,
  Download,
  Terminal,
  Database,
  Layers,
  ShieldCheck,
  FileCode2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepIndicator } from "@/components/step-indicator"
import { loadBriefOrSample } from "@/lib/store"
import { toast } from "sonner"
import type { ProjectBrief } from "@/lib/types"

const DataModelFlow = dynamic(() => import("./data-model-flow"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center text-xs text-zinc-400 font-mono">
      Initializing ERD Topology...
    </div>
  ),
})

type PromptMode = "master" | "database" | "api" | "tdd"

interface TabConfig {
  id: PromptMode
  label: string
  filename: string
  language: string
  icon: typeof Terminal
}

const TABS: TabConfig[] = [
  {
    id: "master",
    label: "Master Scaffold",
    filename: "CURSOR_RULES.md",
    language: "Markdown",
    icon: Terminal,
  },
  {
    id: "database",
    label: "SQL Schema",
    filename: "schema.sql",
    language: "PostgreSQL",
    icon: Database,
  },
  {
    id: "api",
    label: "API Contracts",
    filename: "routes.ts",
    language: "TypeScript",
    icon: Layers,
  },
  {
    id: "tdd",
    label: "TDD & Tests",
    filename: "test-specification.md",
    language: "Markdown",
    icon: ShieldCheck,
  },
]

export default function PromptPage() {
  const [brief] = useState<ProjectBrief>(() => loadBriefOrSample())
  const [activeTab, setActiveTab] = useState<PromptMode>("master")
  const [copied, setCopied] = useState(false)

  const entities = brief?.dataModel ?? []

  function getPromptContent(mode: PromptMode): string {
    if (mode === "database") {
      return `/* ==========================================================================
   DATABASE SCHEMA SPECIFICATION & MIGRATIONS
   Project: ${brief.projectName || "Project"}
   Generated: ${new Date().toISOString()}
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
   Framework: Next.js App Router (TypeScript)
   ========================================================================== */

import { NextResponse } from "next/server";

${brief.routes
  .map(
    (r) => `/**
 * Route: ${r.path}
 * Description: ${r.description}
 */
export async function ${r.path.includes("api") ? "POST" : "GET"}(req: Request) {
  try {
    // 1. Validate payload with Zod schema
    // 2. Enforce session and authorization policies
    // 3. Execute transactional query logic
    return NextResponse.json({ success: true, message: "Handled ${r.path}" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
`
  )
  .join("\n")}
`
    }

    if (mode === "tdd") {
      return `# TDD IMPLEMENTATION & TEST SPECIFICATION: ${brief.projectName || "Application"}

## Objective
Implement comprehensive unit, integration, and E2E test suites before building application features.

## Critical Route Test Suites
${brief.routes
  .map(
    (r) => `### Route Suite: ${r.path} (${r.description})
- [ ] Test 200 OK with valid session and validated payload
- [ ] Test 400 Bad Request with missing or invalid Zod fields
- [ ] Test 401/403 Unauthorized without proper session authentication
- [ ] Test 500 boundary handling and graceful degradation`
  )
  .join("\n\n")}

## Data Integrity & Entity Tests
${brief.dataModel
  .map(
    (e) => `### Entity Test: ${e.name}
- [ ] Verify primary key uniqueness and non-null constraints
- [ ] Verify required field constraints: ${e.fields.map((f) => f.name).join(", ")}
- [ ] Test cascading deletes and relational foreign key integrity`
  )
  .join("\n\n")}

## Recommended Testing Tooling
- Unit & Component: Vitest + React Testing Library
- E2E Integration: Playwright
- Network Mocking: Mock Service Worker (MSW)`
    }

    // Default Master prompt
    return (
      brief.starterPrompt ||
      `# PROJECT STARTER PROMPT: ${brief.projectName || "Application"}

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
    )
  }

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0]
  const currentPrompt = getPromptContent(activeTab)
  const charCount = currentPrompt.length
  const estimatedTokens = Math.round(charCount / 4)

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(currentPrompt)
      setCopied(true)
      toast.success("Prompt copied.")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy.")
    }
  }

  function downloadPromptFile() {
    const filename = currentTab.filename
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
    <div className="max-w-6xl mx-auto space-y-6 py-4 sm:py-6">
      <StepIndicator />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Starter Prompt &amp; Topology
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-xl">
            Interactive relational schema and master prompt templates engineered for AI coding assistants.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
            className="h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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

      {/* Prompt Workbench Studio - Minimalist Code Window */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs overflow-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
              <span className="size-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700 inline-block" />
            </div>

            <div className="flex items-center gap-1.5 font-mono text-zinc-600 dark:text-zinc-400">
              <FileCode2 className="size-3.5" />
              <span>{currentTab.filename}</span>
              <span className="text-[10px] text-zinc-400">({currentTab.language})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
            <span className="tabular-nums">{charCount.toLocaleString()} chars</span>
            <span>·</span>
            <span className="tabular-nums">~{estimatedTokens.toLocaleString()} tokens</span>
          </div>
        </div>

        {/* Studio Tabs & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-md">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs font-medium"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPromptFile}
              className="h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Download className="size-3.5 mr-1.5" />
              Download
            </Button>

            <Button
              size="sm"
              onClick={copyToClipboard}
              className="h-8 px-3.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 rounded-md shadow-xs transition-colors"
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

        {/* Code Viewport - Minimalist Dark Canvas */}
        <div className="bg-[#09090b] p-4 sm:p-5">
          <pre className="relative overflow-auto text-zinc-200 text-xs sm:text-[13px] font-mono leading-relaxed max-h-[500px] selection:bg-zinc-800">
            <code>{currentPrompt}</code>
          </pre>
        </div>

        {/* Bottom Integration Footer */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            Save as <code className="font-mono text-zinc-800 dark:text-zinc-200">{currentTab.filename}</code> in your repository root.
          </span>
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span>Cursor</span>
            <span>·</span>
            <span>Claude Code</span>
            <span>·</span>
            <span>Copilot</span>
            <span>·</span>
            <span>Windsurf</span>
          </div>
        </div>
      </div>
    </div>
  )
}
