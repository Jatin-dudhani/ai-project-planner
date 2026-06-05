"use client"

import { useMemo } from "react"
import {
  ReactFlow,
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dagre from "dagre"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { DataModelEntity } from "@/lib/types"

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

export default function DataModelFlow({ entities }: { entities: DataModelEntity[] }) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => (entities.length > 0 ? getLayoutedElements(entities) : { nodes: [], edges: [] }),
    [entities]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  useMemo(() => {
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges])

  return (
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
  )
}
