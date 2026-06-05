"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Copy, Check, ArrowLeft, RotateCcw } from "lucide-react"
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dagre from "dagre"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { StepIndicator } from "@/components/step-indicator"
import { loadBrief } from "@/lib/store"
import { toast } from "sonner"
import type { ProjectBrief, DataModelEntity } from "@/lib/types"

const nodeWidth = 200
const nodeHeight = 70

function getLayoutedElements(entities: DataModelEntity[]) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 100 })

  const nodes: Node[] = entities.map((entity) => {
    const fieldLines = entity.fields.length + 1
    const height = Math.max(nodeHeight, fieldLines * 24 + 36)
    g.setNode(entity.name, { width: nodeWidth, height })
    return {
      id: entity.name,
      type: "dataModel",
      position: { x: 0, y: 0 },
      data: { label: entity.name, fields: entity.fields },
    }
  })

  const edges: Edge[] = []
  if (entities.length >= 2) {
    for (let i = 0; i < entities.length - 1; i++) {
      const from = entities[i].name
      const to = entities[i + 1].name
      g.setEdge(from, to)
      edges.push({
        id: `e-${from}-${to}`,
        source: from,
        target: to,
        animated: true,
        style: { stroke: "var(--color-muted-foreground)", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--color-muted-foreground)",
          width: 18,
          height: 18,
        },
      })
    }
  }

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - pos.height / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

function DataModelNode({ data }: { data: { label: string; fields: { name: string; type: string }[] } }) {
  return (
    <div className="rounded-xl border-2 border-border/40 bg-card/95 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30" style={{ width: nodeWidth }}>
      <div className="bg-gradient-to-r from-primary/15 to-primary/5 px-3 py-2 text-sm font-bold border-b border-border/30">
        {data.label}
      </div>
      <div className="divide-y divide-border/20">
        {data.fields.map((field, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs">
            <span className="font-mono font-semibold text-foreground/90">{field.name}</span>
            <span className="text-muted-foreground/60 font-medium ml-2">{field.type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const nodeTypes = { dataModel: DataModelNode }

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

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => (entities.length > 0 ? getLayoutedElements(entities) : { nodes: [], edges: [] }),
    [entities]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  useEffect(() => {
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges])

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
          <Card className="border-border/40 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle>Data Model</CardTitle>
              <CardDescription>Visual representation of your data entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] rounded-xl border border-border/30 bg-card/20 overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="var(--color-border)" gap={20} size={1} />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
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
