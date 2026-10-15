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
    toast.success("Brief copied to clipboard in Markdown format!")
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
      toast.success(`Successfully enhanced: ${action.replace("-", " ")}`)
    } catch {
      toast.error("Failed to enhance brief. Please try again.")
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
        toast.success("Architecture validated! Schema structure is 100% compliant.")
      } else {
        toast.error(`Validation issues found: ${result.errors?.join(", ")}`)
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
    a.download = `${(brief.projectName || "project-brief").toLowerCase().replace(/\s+/g, "-")}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded project brief (.md)")
  }

  function handleDownloadJson() {
    const jsonStr = JSON.stringify(brief, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(brief.projectName || "project-brief").toLowerCase().replace(/\s+/g, "-")}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded project specification (.json)")
  }

  function generateMarkdown(b: ProjectBrief): string {
    return `# ${b.projectName || "Project Specification"}

## Summary
${b.summary}

## Target Users
${b.targetUsers.map((u) => `- ${u}`).join("\n")}

## Core Features
${b.coreFeatures.map((f) => `- ${f}`).join("\n")}

## Technical Stack
${b.techStack
  .map((cat) => `### ${cat.category}\n${cat.items.map((i) => `- ${i}`).join("\n")}`)
  .join("\n\n")}

## Route Topology
${b.routes.map((r) => `- \`${r.path}\`: ${r.description}`).join("\n")}

## Data Entities
${b.dataModel
  .map(
    (e) =>
      `### ${e.name}\n${e.fields.map((f) => `- \`${f.name}\`: ${f.type}`).join("\n")}`
  )
  .join("\n\n")}

## Phased Implementation Plan
${b.buildPhases
  .map((p) => `### ${p.phase}\n${p.tasks.map((t) => `- [ ] ${t}`).join("\n")}`)
  .join("\n\n")}

## Risk & Mitigation Register
${b.risks.map((r) => `- **Risk**: ${r.risk}\n  - **Mitigation**: ${r.mitigation}`).join("\n\n")}
`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      <StepIndicator />

      {/* Header & Workbench Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Input
              value={brief.projectName || "Project Specification"}
              onChange={(e) =>
                updateBrief((b) => ({ ...b, projectName: e.target.value }))
              }
              className="text-2xl sm:text-3xl font-bold tracking-tight bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-neutral-900 dark:text-neutral-50"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span>{brief.routes.length} Routes</span>
            <span aria-hidden="true">·</span>
            <span>{brief.dataModel.length} Entities</span>
            <span aria-hidden="true">·</span>
            <span>{brief.buildPhases.length} Phases</span>
            <span aria-hidden="true">·</span>
            <span>{brief.risks.length} Risks Identified</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={isValidating}
            className="h-8 text-xs text-neutral-700 dark:text-neutral-300"
          >
            {isValidating ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : (
              <ShieldCheck className="size-3.5 mr-1.5 text-neutral-500" />
            )}
            Validate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRefine("expand-features")}
            disabled={isRefining}
            className="h-8 text-xs text-neutral-700 dark:text-neutral-300"
          >
            {isRefining ? (
              <Loader2 className="size-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5 mr-1.5 text-neutral-500" />
            )}
            AI Expand
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="h-8 text-xs text-neutral-700 dark:text-neutral-300"
          >
            {copied ? <Check className="size-3.5 mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Markdown"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMarkdown}
            className="h-8 text-xs text-neutral-700 dark:text-neutral-300"
          >
            <Download className="size-3.5 mr-1.5" />
            .MD
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="h-8 text-xs text-neutral-700 dark:text-neutral-300"
          >
            <Download className="size-3.5 mr-1.5" />
            .JSON
          </Button>

          <Button
            size="sm"
            asChild
            className="h-8 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900"
          >
            <Link href="/prompt">
              Next: Prompt &amp; ERD
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Summary — Full Width */}
        <section className="md:col-span-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Executive Summary &amp; Vision
            </h2>
          </div>
          <Textarea
            className="min-h-24 text-sm leading-relaxed border-neutral-200 dark:border-neutral-800"
            value={brief.summary}
            onChange={(e) =>
              updateBrief((b) => ({ ...b, summary: e.target.value }))
            }
            placeholder="Overview of the product and primary value proposition..."
          />
        </section>

        {/* Target Users */}
        <section className="md:col-span-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Target User Groups
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
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
                  className="h-8 text-xs border-neutral-200 dark:border-neutral-800"
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
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Core Features */}
        <section className="md:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Core Feature Matrix
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
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
                <span className="text-xs text-neutral-400 font-mono w-5 shrink-0 text-right">
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
                  className="h-8 text-xs border-neutral-200 dark:border-neutral-800"
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
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Breakdown */}
        <section className="md:col-span-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Technology Stack &amp; Architecture
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
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
                className="rounded-lg border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-800/30 p-3 space-y-2"
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
                    className="h-6 text-xs font-semibold bg-transparent border-none p-0 focus-visible:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateBrief((b) => ({
                        ...b,
                        techStack: b.techStack.filter((_, j) => j !== i),
                      }))
                    }
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {cat.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-1 group">
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
                        className="h-7 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
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
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 w-full text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
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
        <section className="md:col-span-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="size-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Application Route Hierarchy &amp; Endpoints
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
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

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800">
            {brief.routes.map((route, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
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
                  className="h-8 w-44 font-mono text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shrink-0 font-semibold text-neutral-800 dark:text-neutral-200"
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
                  className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 flex-1"
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
                  className="p-1 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Data Models */}
        <section className="md:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Relational Data Entities &amp; Schemas
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
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
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                  <Input
                    value={entity.name}
                    onChange={(e) =>
                      updateBrief((b) => {
                        const next = [...b.dataModel]
                        next[i] = { ...next[i], name: e.target.value }
                        return { ...b, dataModel: next }
                      })
                    }
                    className="h-7 text-xs font-semibold bg-transparent border-none p-0 focus-visible:ring-0 text-neutral-900 dark:text-neutral-100"
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
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
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
                        className="h-7 text-xs font-mono flex-1 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                        placeholder="fieldName"
                      />
                      <span className="text-xs text-neutral-400 font-mono">:</span>
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
                        className="h-7 text-xs font-mono w-40 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                        placeholder="VARCHAR(255)"
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
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
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
        <section className="md:col-span-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Phased Roadmap
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
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
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/30 p-3 space-y-2"
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
                    className="h-6 text-xs font-semibold bg-transparent border-none p-0 focus-visible:ring-0 text-neutral-900 dark:text-neutral-100"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateBrief((b) => ({
                        ...b,
                        buildPhases: b.buildPhases.filter((_, j) => j !== i),
                      }))
                    }
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {phase.tasks.map((task, j) => (
                    <div key={j} className="flex items-center gap-1.5 group">
                      <span className="size-1.5 rounded-full bg-neutral-400 shrink-0" />
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
                        className="h-7 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
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
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
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
        <section className="md:col-span-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Risk &amp; Mitigation Register
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
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
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/30 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
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
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
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
                  className="h-7 text-xs font-medium bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
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
                  className="min-h-16 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 leading-relaxed"
                  placeholder="Mitigation strategy"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs text-neutral-600 dark:text-neutral-400"
        >
          <Link href="/">
            <RotateCcw className="size-3.5 mr-1.5" />
            Back to Idea Canvas
          </Link>
        </Button>

        <Button
          size="sm"
          asChild
          className="text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900"
        >
          <Link href="/prompt">
            Proceed to AI Prompt &amp; Topology
            <ArrowRight className="size-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
