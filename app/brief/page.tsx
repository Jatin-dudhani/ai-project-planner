"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Users,
  Layers,
  Route,
  Database,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StepIndicator } from "@/components/step-indicator"
import { loadBriefOrSample, saveBrief, clearBrief } from "@/lib/store"
import type { ProjectBrief } from "@/lib/types"
import { toast } from "sonner"

export default function BriefPage() {
  const router = useRouter()
  const [brief, setBrief] = useState<ProjectBrief>(() => loadBriefOrSample())
  const [copied, setCopied] = useState(false)

  function updateBrief(updater: (prev: ProjectBrief) => ProjectBrief) {
    setBrief((prev) => {
      const next = updater(prev)
      saveBrief(next)
      return next
    })
  }

  function handleCopyMarkdown() {
    const md = generateMarkdown(brief)
    navigator.clipboard.writeText(md)
    setCopied(true)
    toast.success("Brief copied to clipboard.")
    setTimeout(() => setCopied(false), 2000)
  }

  const [isRefining, setIsRefining] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  async function handleRefine(action: "expand-features" | "expand-data" | "expand-risks") {
    setIsRefining(true)
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, action }),
      })
      if (!res.ok) throw new Error("Refinement failed")
      const updated: ProjectBrief = await res.json()
      updateBrief(() => updated)
      toast.success(`Enhanced: ${action.replace("-", " ")}`)
    } catch {
      toast.error("Failed to enhance brief.")
    } finally {
      setIsRefining(false)
    }
  }

  async function handleValidate() {
    setIsValidating(true)
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      })
      const result = await res.json()
      if (result.valid) {
        toast.success("Schema & architecture validated successfully.")
      } else {
        toast.error(`Validation issues: ${result.errors?.join(", ")}`)
      }
    } catch {
      toast.error("Failed to run validation.")
    } finally {
      setIsValidating(false)
    }
  }

  function handleDownloadMarkdown() {
    const md = generateMarkdown(brief)
    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(brief.projectName || "project-brief").toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded Markdown brief.")
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(brief, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(brief.projectName || "project-brief").toLowerCase().replace(/[^a-z0-9]/g, "-")}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded JSON specification.")
  }

  function generateMarkdown(b: ProjectBrief): string {
    return `# ${b.projectName || "Project Specification"}

## Summary
${b.summary}

## Target Users
${b.targetUsers.map((u) => `- ${u}`).join("\n")}

## Core Features
${b.coreFeatures.map((f) => `- ${f}`).join("\n")}

## Technology Stack
${b.techStack.map((t) => `### ${t.category}\n${t.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n")}

## Route Topology & API Contracts
${b.routes.map((r) => `- \`${r.path}\`: ${r.description}`).join("\n")}

## Relational Schema
${b.dataModel
  .map(
    (e) => `### ${e.name}
| Field | Type |
|---|---|
${e.fields.map((f) => `| \`${f.name}\` | \`${f.type}\` |`).join("\n")}`
  )
  .join("\n\n")}

## Implementation Roadmap
${b.buildPhases
  .map((p) => `### ${p.phase}\n${p.tasks.map((t) => `- [ ] ${t}`).join("\n")}`)
  .join("\n\n")}

## Risk & Mitigation Register
${b.risks.map((r) => `- **Risk**: ${r.risk}\n  - **Mitigation**: ${r.mitigation}`).join("\n\n")}
`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 sm:py-6">
      <StepIndicator />

      {/* Header & Workbench Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="space-y-1.5 flex-1">
          <Input
            value={brief.projectName || "Project Specification"}
            onChange={(e) =>
              updateBrief((b) => ({ ...b, projectName: e.target.value }))
            }
            className="text-2xl sm:text-3xl font-semibold tracking-tight bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-zinc-950 dark:text-zinc-50"
          />
          <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
              {brief.routes.length} Routes
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
              {brief.dataModel.length} Entities
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
              {brief.buildPhases.length} Phases
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
              {brief.risks.length} Risks
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isValidating}
            className="h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {isValidating ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : (
              <ShieldCheck className="size-3.5 mr-1.5 text-zinc-500" />
            )}
            Validate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefine("expand-features")}
            disabled={isRefining}
            className="h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {isRefining ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5 mr-1.5 text-zinc-500" />
            )}
            AI Refine
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {copied ? <Check className="size-3.5 mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMarkdown}
            className="h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Download className="size-3.5 mr-1.5" />
            .MD
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="h-8 text-xs border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Download className="size-3.5 mr-1.5" />
            .JSON
          </Button>

          <Button
            size="sm"
            asChild
            className="h-8 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 rounded-lg shadow-xs"
          >
            <Link href="/prompt">
              Prompts &amp; Topology
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Summary — Full Width */}
        <section className="md:col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Project Overview &amp; Summary
            </h2>
          </div>
          <Textarea
            className="min-h-24 text-sm leading-relaxed border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-zinc-950 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 rounded-lg"
            value={brief.summary}
            onChange={(e) =>
              updateBrief((b) => ({ ...b, summary: e.target.value }))
            }
            placeholder="Overview of the product and primary value proposition..."
          />
        </section>

        {/* Target Users */}
        <section className="md:col-span-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Target Users
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() =>
                updateBrief((b) => ({ ...b, targetUsers: [...b.targetUsers, ""] }))
              }
            >
              <Plus className="size-3 mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {brief.targetUsers.map((user, i) => (
              <div key={i} className="flex items-center gap-1.5 group">
                <Input
                  value={user}
                  onChange={(e) =>
                    updateBrief((b) => {
                      const next = [...b.targetUsers]
                      next[i] = e.target.value
                      return { ...b, targetUsers: next }
                    })
                  }
                  className="h-8 text-xs border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-zinc-950 dark:text-zinc-50 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                  placeholder="e.g. Remote Developers"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateBrief((b) => ({
                      ...b,
                      targetUsers: b.targetUsers.filter((_, j) => j !== i),
                    }))
                  }
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Core Features */}
        <section className="md:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Core Features
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() =>
                updateBrief((b) => ({ ...b, coreFeatures: [...b.coreFeatures, ""] }))
              }
            >
              <Plus className="size-3 mr-1" /> Add Feature
            </Button>
          </div>

          <div className="space-y-2">
            {brief.coreFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 group">
                <span className="text-xs text-zinc-400 font-mono w-5 shrink-0 text-right">
                  {i + 1}.
                </span>
                <Input
                  value={feature}
                  onChange={(e) =>
                    updateBrief((b) => {
                      const next = [...b.coreFeatures]
                      next[i] = e.target.value
                      return { ...b, coreFeatures: next }
                    })
                  }
                  className="h-8 text-xs border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 text-zinc-950 dark:text-zinc-50 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                  placeholder="Feature capability description..."
                />
                <button
                  type="button"
                  onClick={() =>
                    updateBrief((b) => ({
                      ...b,
                      coreFeatures: b.coreFeatures.filter((_, j) => j !== i),
                    }))
                  }
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Breakdown */}
        <section className="md:col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Technology Stack &amp; Infrastructure
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() =>
                updateBrief((b) => ({
                  ...b,
                  techStack: [...b.techStack, { category: "Tooling", items: ["New Item"] }],
                }))
              }
            >
              <Plus className="size-3 mr-1" /> Add Category
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {brief.techStack.map((cat, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-1">
                  <Input
                    value={cat.category}
                    onChange={(e) =>
                      updateBrief((b) => {
                        const next = [...b.techStack]
                        next[i] = { ...next[i], category: e.target.value }
                        return { ...b, techStack: next }
                      })
                    }
                    className="h-6 text-xs font-semibold text-zinc-950 dark:text-zinc-50 bg-transparent border-none p-0 focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateBrief((b) => ({
                        ...b,
                        techStack: b.techStack.filter((_, j) => j !== i),
                      }))
                    }
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {cat.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-1.5 group">
                      <Input
                        value={item}
                        onChange={(e) =>
                          updateBrief((b) => {
                            const next = [...b.techStack]
                            const items = [...next[i].items]
                            items[j] = e.target.value
                            next[i] = { ...next[i], items }
                            return { ...b, techStack: next }
                          })
                        }
                        className="h-7 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateBrief((b) => {
                            const next = [...b.techStack]
                            next[i] = {
                              ...next[i],
                              items: next[i].items.filter((_, k) => k !== j),
                            }
                            return { ...b, techStack: next }
                          })
                        }
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 w-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    onClick={() =>
                      updateBrief((b) => {
                        const next = [...b.techStack]
                        next[i] = { ...next[i], items: [...next[i].items, ""] }
                        return { ...b, techStack: next }
                      })
                    }
                  >
                    <Plus className="size-2.5 mr-1" /> Add Item
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Routes & API Architecture */}
        <section className="md:col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="size-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Route Hierarchy &amp; API Contracts
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() =>
                updateBrief((b) => ({
                  ...b,
                  routes: [...b.routes, { path: "/new-route", description: "Route purpose" }],
                }))
              }
            >
              <Plus className="size-3 mr-1" /> Add Route
            </Button>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900/60">
            {brief.routes.map((route, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <Input
                  value={route.path}
                  onChange={(e) =>
                    updateBrief((b) => {
                      const next = [...b.routes]
                      next[i] = { ...next[i], path: e.target.value }
                      return { ...b, routes: next }
                    })
                  }
                  className="h-8 w-44 font-mono text-xs bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 shrink-0 font-medium text-zinc-950 dark:text-zinc-50 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                  placeholder="/endpoint"
                />
                <Input
                  value={route.description}
                  onChange={(e) =>
                    updateBrief((b) => {
                      const next = [...b.routes]
                      next[i] = { ...next[i], description: e.target.value }
                      return { ...b, routes: next }
                    })
                  }
                  className="h-8 text-xs bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 flex-1 text-zinc-800 dark:text-zinc-200 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                  placeholder="Page/Route functional responsibility"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateBrief((b) => ({
                      ...b,
                      routes: b.routes.filter((_, j) => j !== i),
                    }))
                  }
                  className="p-1 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Data Models */}
        <section className="md:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Relational Data Schema
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() =>
                updateBrief((b) => ({
                  ...b,
                  dataModel: [
                    ...b.dataModel,
                    { name: "NewEntity", fields: [{ name: "id", type: "UUID" }] },
                  ],
                }))
              }
            >
              <Plus className="size-3 mr-1" /> Add Entity
            </Button>
          </div>

          <div className="space-y-3">
            {brief.dataModel.map((entity, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <Input
                    value={entity.name}
                    onChange={(e) =>
                      updateBrief((b) => {
                        const next = [...b.dataModel]
                        next[i] = { ...next[i], name: e.target.value }
                        return { ...b, dataModel: next }
                      })
                    }
                    className="h-6 text-xs font-semibold text-zinc-950 dark:text-zinc-50 bg-transparent border-none p-0 focus-visible:ring-0"
                    placeholder="Entity Name"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateBrief((b) => ({
                        ...b,
                        dataModel: b.dataModel.filter((_, j) => j !== i),
                      }))
                    }
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {entity.fields.map((field, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateBrief((b) => {
                            const next = [...b.dataModel]
                            const fields = [...next[i].fields]
                            fields[j] = { ...fields[j], name: e.target.value }
                            next[i] = { ...next[i], fields }
                            return { ...b, dataModel: next }
                          })
                        }
                        className="h-7 text-xs font-mono flex-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                        placeholder="fieldName"
                      />
                      <span className="text-xs text-zinc-400 font-mono">:</span>
                      <Input
                        value={field.type}
                        onChange={(e) =>
                          updateBrief((b) => {
                            const next = [...b.dataModel]
                            const fields = [...next[i].fields]
                            fields[j] = { ...fields[j], type: e.target.value }
                            next[i] = { ...next[i], fields }
                            return { ...b, dataModel: next }
                          })
                        }
                        className="h-7 text-xs font-mono w-36 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                        placeholder="VARCHAR"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateBrief((b) => {
                            const next = [...b.dataModel]
                            next[i] = {
                              ...next[i],
                              fields: next[i].fields.filter((_, k) => k !== j),
                            }
                            return { ...b, dataModel: next }
                          })
                        }
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    onClick={() =>
                      updateBrief((b) => {
                        const next = [...b.dataModel]
                        next[i] = {
                          ...next[i],
                          fields: [...next[i].fields, { name: "attribute", type: "STRING" }],
                        }
                        return { ...b, dataModel: next }
                      })
                    }
                  >
                    <Plus className="size-2.5 mr-1" /> Add Field
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Build Roadmap Phases */}
        <section className="md:col-span-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Roadmap
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() =>
                updateBrief((b) => ({
                  ...b,
                  buildPhases: [
                    ...b.buildPhases,
                    { phase: `Phase ${b.buildPhases.length + 1}: Expansion`, tasks: ["New Task"] },
                  ],
                }))
              }
            >
              <Plus className="size-3 mr-1" /> Add Phase
            </Button>
          </div>

          <div className="space-y-3">
            {brief.buildPhases.map((phase, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-1">
                  <Input
                    value={phase.phase}
                    onChange={(e) =>
                      updateBrief((b) => {
                        const next = [...b.buildPhases]
                        next[i] = { ...next[i], phase: e.target.value }
                        return { ...b, buildPhases: next }
                      })
                    }
                    className="h-6 text-xs font-semibold text-zinc-950 dark:text-zinc-50 bg-transparent border-none p-0 focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateBrief((b) => ({
                        ...b,
                        buildPhases: b.buildPhases.filter((_, j) => j !== i),
                      }))
                    }
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {phase.tasks.map((task, j) => (
                    <div key={j} className="flex items-center gap-1.5 group">
                      <span className="size-1 rounded-full bg-zinc-400 shrink-0" />
                      <Input
                        value={task}
                        onChange={(e) =>
                          updateBrief((b) => {
                            const next = [...b.buildPhases]
                            const tasks = [...next[i].tasks]
                            tasks[j] = e.target.value
                            next[i] = { ...next[i], tasks }
                            return { ...b, buildPhases: next }
                          })
                        }
                        className="h-7 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateBrief((b) => {
                            const next = [...b.buildPhases]
                            next[i] = {
                              ...next[i],
                              tasks: next[i].tasks.filter((_, k) => k !== j),
                            }
                            return { ...b, buildPhases: next }
                          })
                        }
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    onClick={() =>
                      updateBrief((b) => {
                        const next = [...b.buildPhases]
                        next[i] = { ...next[i], tasks: [...next[i].tasks, ""] }
                        return { ...b, buildPhases: next }
                      })
                    }
                  >
                    <Plus className="size-2.5 mr-1" /> Add Task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Risk & Mitigation Register */}
        <section className="md:col-span-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-zinc-500 dark:text-zinc-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Risk &amp; Mitigation Register
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() =>
                updateBrief((b) => ({
                  ...b,
                  risks: [...b.risks, { risk: "New identified risk", mitigation: "Strategy" }],
                }))
              }
            >
              <Plus className="size-3 mr-1" /> Add Risk
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {brief.risks.map((item, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                    Risk #{i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateBrief((b) => ({
                        ...b,
                        risks: b.risks.filter((_, j) => j !== i),
                      }))
                    }
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>
                <Input
                  value={item.risk}
                  onChange={(e) =>
                    updateBrief((b) => {
                      const next = [...b.risks]
                      next[i] = { ...next[i], risk: e.target.value }
                      return { ...b, risks: next }
                    })
                  }
                  className="h-7 text-xs font-medium bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                  placeholder="Risk description"
                />
                <Textarea
                  value={item.mitigation}
                  onChange={(e) =>
                    updateBrief((b) => {
                      const next = [...b.risks]
                      next[i] = { ...next[i], mitigation: e.target.value }
                      return { ...b, risks: next }
                    })
                  }
                  className="min-h-16 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md leading-relaxed focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
                  placeholder="Mitigation strategy"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Link href="/">
            <RotateCcw className="size-3.5 mr-1.5" />
            Back to Idea Canvas
          </Link>
        </Button>

        <Button
          size="sm"
          asChild
          className="text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 h-8 px-4 rounded-lg shadow-xs"
        >
          <Link href="/prompt">
            Proceed to Prompts &amp; Topology
            <ArrowRight className="size-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
