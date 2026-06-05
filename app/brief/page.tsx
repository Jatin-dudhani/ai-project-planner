"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Plus, Trash2, Users, Sparkles, Box, Route, Database, Building2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StepIndicator } from "@/components/step-indicator"
import { loadBrief, saveBrief } from "@/lib/store"
import type { ProjectBrief } from "@/lib/types"
import { cn } from "@/lib/utils"

const sectionAccents = {
  summary: "before:bg-primary/40",
  users: "before:bg-blue-500/40",
  features: "before:bg-emerald-500/40",
  tech: "before:bg-violet-500/40",
  routes: "before:bg-amber-500/40",
  data: "before:bg-cyan-500/40",
  phases: "before:bg-rose-500/40",
  risks: "before:bg-orange-500/40",
} as const

function CardSection({
  children,
  accent,
  className,
}: {
  children: React.ReactNode
  accent?: keyof typeof sectionAccents
  className?: string
}) {
  return (
    <Card
      className={cn(
        "border-border/40 shadow-lg hover:shadow-xl transition-all duration-500 group/card h-full",
        "relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-r-full before:opacity-60 before:transition-opacity before:duration-500",
        "hover:before:opacity-100",
        accent ? sectionAccents[accent] : sectionAccents.summary,
        className
      )}
    >
      <div className="relative z-0">{children}</div>
    </Card>
  )
}

function SectionIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="size-4 text-muted-foreground/40 group-hover/card:text-primary/50 transition-colors duration-500 shrink-0">
      {icon}
    </span>
  )
}

export default function BriefPage() {
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

  function updateBrief(updater: (prev: ProjectBrief) => ProjectBrief) {
    setBrief((prev) => {
      if (!prev) return prev
      const next = updater(prev)
      saveBrief(next)
      return next
    })
  }

  if (!brief) return null

  return (
    <>
      <StepIndicator />

      <div className="text-center space-y-3 mt-8 animate-fade-up stagger-1">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          Project <span className="text-primary">Brief</span>
        </h1>
        <p className="text-lg text-muted-foreground/70">
          Edit and refine your generated project brief.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-8">

        {/* Summary — full width prominent */}
        <div className="animate-fade-up stagger-2 md:col-span-3">
          <CardSection accent="summary">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <SectionIcon icon={<Sparkles className="size-4" />} />
                <CardTitle>Summary</CardTitle>
              </div>
              <CardDescription>Overview of your project</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0">
              <Textarea
                className="min-h-32 text-base leading-relaxed"
                value={brief.summary}
                onChange={(e) =>
                  updateBrief((b) => ({ ...b, summary: e.target.value }))
                }
              />
            </CardContent>
          </CardSection>
        </div>

        {/* Target Users — wide */}
        <div className="animate-fade-up stagger-3 md:col-span-2">
          <CardSection accent="users">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <SectionIcon icon={<Users className="size-4" />} />
                <CardTitle>Target Users</CardTitle>
              </div>
              <CardDescription>Who will use your app</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0 space-y-3">
              {brief.targetUsers.map((user, i) => (
                <div key={i} className="flex items-center gap-2 group/user">
                  <Input
                    value={user}
                    onChange={(e) =>
                      updateBrief((b) => {
                        const next = [...b.targetUsers]
                        next[i] = e.target.value
                        return { ...b, targetUsers: next }
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateBrief((b) => ({
                        ...b,
                        targetUsers: b.targetUsers.filter((_, j) => j !== i),
                      }))
                    }
                    className="opacity-0 group-hover/user:opacity-100 transition-all duration-300 hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateBrief((b) => ({ ...b, targetUsers: [...b.targetUsers, ""] }))}>
                <Plus className="size-3.5 mr-1" /> Add User
              </Button>
            </CardContent>
          </CardSection>
        </div>

        {/* Core Features — narrow */}
        <div className="animate-fade-up stagger-4 md:col-span-1">
          <CardSection accent="features">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <SectionIcon icon={<Sparkles className="size-4" />} />
                <CardTitle>Core Features</CardTitle>
              </div>
              <CardDescription>Key functionality</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0 space-y-3">
              <div className="flex flex-wrap gap-2">
                {brief.coreFeatures.map((feature, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pl-0 overflow-hidden">
                    <Input
                      value={feature}
                      onChange={(e) =>
                        updateBrief((b) => {
                          const next = [...b.coreFeatures]
                          next[i] = e.target.value
                          return { ...b, coreFeatures: next }
                        })
                      }
                      className="h-7 w-auto min-w-16 border-none bg-transparent px-2 text-xs shadow-none focus-visible:ring-0"
                    />
                    <button
                      onClick={() => updateBrief((b) => ({ ...b, coreFeatures: b.coreFeatures.filter((_, j) => j !== i) }))}
                      className="px-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => updateBrief((b) => ({ ...b, coreFeatures: [...b.coreFeatures, ""] }))}>
                <Plus className="size-3.5 mr-1" /> Add Feature
              </Button>
            </CardContent>
          </CardSection>
        </div>

        {/* Tech Stack — narrow */}
        <div className="animate-fade-up stagger-5 md:col-span-1">
          <CardSection accent="tech">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <SectionIcon icon={<Box className="size-4" />} />
                <CardTitle>Tech Stack</CardTitle>
              </div>
              <CardDescription>Technologies</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0 space-y-4">
              {brief.techStack.map((stack, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-border/30 bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={stack.category}
                      onChange={(e) => {
                        const next = [...brief.techStack]
                        next[i] = { ...next[i], category: e.target.value }
                        updateBrief((b) => ({ ...b, techStack: next }))
                      }}
                      className="h-7 flex-1 text-sm font-medium"
                      placeholder="Category"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => updateBrief((b) => ({ ...b, techStack: b.techStack.filter((_, j) => j !== i) }))}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.items.map((item, j) => (
                      <Badge key={j} variant="outline" className="gap-1 pl-0 overflow-hidden">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const next = [...brief.techStack]
                            const items = [...next[i].items]
                            items[j] = e.target.value
                            next[i] = { ...next[i], items }
                            updateBrief((b) => ({ ...b, techStack: next }))
                          }}
                          className="h-6 w-auto min-w-12 border-none bg-transparent px-2 text-xs shadow-none focus-visible:ring-0"
                        />
                        <button
                          onClick={() => {
                            const next = [...brief.techStack]
                            next[i] = { ...next[i], items: next[i].items.filter((_, k) => k !== j) }
                            updateBrief((b) => ({ ...b, techStack: next }))
                          }}
                          className="px-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-2.5" />
                        </button>
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                      const next = [...brief.techStack]
                      next[i] = { ...next[i], items: [...next[i].items, ""] }
                      updateBrief((b) => ({ ...b, techStack: next }))
                    }}>
                      <Plus className="size-3 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateBrief((b) => ({ ...b, techStack: [...b.techStack, { category: "", items: [""] }] }))}>
                <Plus className="size-3.5 mr-1" /> Add Category
              </Button>
            </CardContent>
          </CardSection>
        </div>

        {/* Routes — wide */}
        <div className="animate-fade-up stagger-6 md:col-span-2">
          <CardSection accent="routes">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <SectionIcon icon={<Route className="size-4" />} />
                <CardTitle>Routes</CardTitle>
              </div>
              <CardDescription>App routes and their purposes</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0 space-y-3">
              {brief.routes.map((route, i) => (
                <div key={i} className="flex items-center gap-2 group/route">
                  <Input
                    value={route.path}
                    onChange={(e) => {
                      const next = [...brief.routes]
                      next[i] = { ...next[i], path: e.target.value }
                      updateBrief((b) => ({ ...b, routes: next }))
                    }}
                    className="w-28 lg:w-36 font-mono text-xs shrink-0"
                    placeholder="/path"
                  />
                  <Input
                    value={route.description}
                    onChange={(e) => {
                      const next = [...brief.routes]
                      next[i] = { ...next[i], description: e.target.value }
                      updateBrief((b) => ({ ...b, routes: next }))
                    }}
                    placeholder="Description"
                  />
                  <Button variant="ghost" size="icon" onClick={() => updateBrief((b) => ({ ...b, routes: b.routes.filter((_, j) => j !== i) }))}
                    className="opacity-0 group-hover/route:opacity-100 transition-all duration-300 shrink-0">
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateBrief((b) => ({ ...b, routes: [...b.routes, { path: "", description: "" }] }))}>
                <Plus className="size-3.5 mr-1" /> Add Route
              </Button>
            </CardContent>
          </CardSection>
        </div>

        {/* Data Model — wide */}
        <div className="animate-fade-up stagger-7 md:col-span-2">
          <CardSection accent="data">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <SectionIcon icon={<Database className="size-4" />} />
                <CardTitle>Data Model</CardTitle>
              </div>
              <CardDescription>Core data entities</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0 space-y-4">
              {brief.dataModel.map((entity, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-border/30 bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={entity.name}
                      onChange={(e) => {
                        const next = [...brief.dataModel]
                        next[i] = { ...next[i], name: e.target.value }
                        updateBrief((b) => ({ ...b, dataModel: next }))
                      }}
                      className="h-7 flex-1 text-sm font-medium"
                      placeholder="Entity name"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => updateBrief((b) => ({ ...b, dataModel: b.dataModel.filter((_, j) => j !== i) }))}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    {entity.fields.map((field, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Input
                          value={field.name}
                          onChange={(e) => {
                            const next = [...brief.dataModel]
                            const fields = [...next[i].fields]
                            fields[j] = { ...fields[j], name: e.target.value }
                            next[i] = { ...next[i], fields }
                            updateBrief((b) => ({ ...b, dataModel: next }))
                          }}
                          className="h-7 flex-1 font-mono text-xs"
                          placeholder="fieldName"
                        />
                        <span className="text-xs text-muted-foreground/50 shrink-0">:</span>
                        <Input
                          value={field.type}
                          onChange={(e) => {
                            const next = [...brief.dataModel]
                            const fields = [...next[i].fields]
                            fields[j] = { ...fields[j], type: e.target.value }
                            next[i] = { ...next[i], fields }
                            updateBrief((b) => ({ ...b, dataModel: next }))
                          }}
                          className="h-7 w-20 shrink-0 text-xs"
                          placeholder="string"
                        />
                        <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => {
                          const next = [...brief.dataModel]
                          next[i] = { ...next[i], fields: next[i].fields.filter((_, k) => k !== j) }
                          updateBrief((b) => ({ ...b, dataModel: next }))
                        }}>
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                      const next = [...brief.dataModel]
                      next[i] = { ...next[i], fields: [...next[i].fields, { name: "", type: "" }] }
                      updateBrief((b) => ({ ...b, dataModel: next }))
                    }}>
                      <Plus className="size-3 mr-1" /> Add Field
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateBrief((b) => ({ ...b, dataModel: [...b.dataModel, { name: "", fields: [{ name: "", type: "" }] }] }))}>
                <Plus className="size-3.5 mr-1" /> Add Entity
              </Button>
            </CardContent>
          </CardSection>
        </div>

        {/* Build Phases — narrow */}
        <div className="animate-fade-up stagger-8 md:col-span-1">
          <CardSection accent="phases">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <SectionIcon icon={<Building2 className="size-4" />} />
                <CardTitle>Build Phases</CardTitle>
              </div>
              <CardDescription>Implementation plan</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0 space-y-4">
              {brief.buildPhases.map((phase, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-border/30 bg-muted/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={phase.phase}
                      onChange={(e) => {
                        const next = [...brief.buildPhases]
                        next[i] = { ...next[i], phase: e.target.value }
                        updateBrief((b) => ({ ...b, buildPhases: next }))
                      }}
                      className="h-7 flex-1 text-xs font-medium"
                      placeholder="Phase name"
                    />
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => updateBrief((b) => ({ ...b, buildPhases: b.buildPhases.filter((_, j) => j !== i) }))}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {phase.tasks.map((task, j) => (
                      <div key={j} className="flex items-center gap-2 group/task">
                        <span className="text-xs text-muted-foreground/40 shrink-0">•</span>
                        <Input
                          value={task}
                          onChange={(e) => {
                            const next = [...brief.buildPhases]
                            const tasks = [...next[i].tasks]
                            tasks[j] = e.target.value
                            next[i] = { ...next[i], tasks }
                            updateBrief((b) => ({ ...b, buildPhases: next }))
                          }}
                          className="h-7 flex-1 text-xs"
                          placeholder="Task description"
                        />
                        <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover/task:opacity-100 transition-all duration-300 shrink-0" onClick={() => {
                          const next = [...brief.buildPhases]
                          next[i] = { ...next[i], tasks: next[i].tasks.filter((_, k) => k !== j) }
                          updateBrief((b) => ({ ...b, buildPhases: next }))
                        }}>
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                      const next = [...brief.buildPhases]
                      next[i] = { ...next[i], tasks: [...next[i].tasks, ""] }
                      updateBrief((b) => ({ ...b, buildPhases: next }))
                    }}>
                      <Plus className="size-3 mr-1" /> Add Task
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => updateBrief((b) => ({ ...b, buildPhases: [...b.buildPhases, { phase: "", tasks: [""] }] }))}>
                <Plus className="size-3.5 mr-1" /> Add Phase
              </Button>
            </CardContent>
          </CardSection>
        </div>

        {/* Risks — full width */}
        <div className="animate-fade-up stagger-9 md:col-span-3">
          <CardSection accent="risks">
            <CardHeader className="p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <SectionIcon icon={<AlertTriangle className="size-4" />} />
                <CardTitle>Risks &amp; Mitigations</CardTitle>
              </div>
              <CardDescription>Potential risks and how to address them</CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 pt-0 sm:pt-0 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {brief.risks.map((risk, i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-border/30 bg-muted/20 p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={risk.risk}
                        onChange={(e) => {
                          const next = [...brief.risks]
                          next[i] = { ...next[i], risk: e.target.value }
                          updateBrief((b) => ({ ...b, risks: next }))
                        }}
                        placeholder="Risk"
                        className="text-sm"
                      />
                      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => updateBrief((b) => ({ ...b, risks: b.risks.filter((_, j) => j !== i) }))}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={risk.mitigation}
                      onChange={(e) => {
                        const next = [...brief.risks]
                        next[i] = { ...next[i], mitigation: e.target.value }
                        updateBrief((b) => ({ ...b, risks: next }))
                      }}
                      placeholder="Mitigation strategy"
                      className="text-xs text-muted-foreground/60"
                    />
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => updateBrief((b) => ({ ...b, risks: [...b.risks, { risk: "", mitigation: "" }] }))}>
                <Plus className="size-3.5 mr-1" /> Add Risk
              </Button>
            </CardContent>
          </CardSection>
        </div>
      </div>

      <div className="flex justify-center mt-8 animate-fade-up stagger-10">
        <Button size="lg" onClick={() => router.push("/prompt")} className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30">
          Next: Starter Prompt <ArrowRight className="size-5 ml-2" />
        </Button>
      </div>
    </>
  )
}
