"use client"

import { useMemo, useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dagre from "dagre"
import type { DataModelEntity } from "@/lib/types"

const nodeWidth = 240
const baseHeight = 80

function getLayoutedElements(entities: DataModelEntity[]) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 80 })

  const nodes: Node[] = entities.map((entity) => {
    const fieldLines = entity.fields.length
    const height = Math.max(baseHeight, 46 + fieldLines * 26)
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
        style: { stroke: "oklch(0.68 0.18 240 / 0.7)", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "oklch(0.68 0.18 240 / 0.8)",
          width: 16,
          height: 16,
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
        y: pos.y - (pos.height || baseHeight) / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

function DataModelNode({
  data,
}: {
  data: { label: string; fields: { name: string; type: string }[] }
}) {
  return (
    <div
      className="relative rounded-lg border border-neutral-300/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden text-neutral-900 dark:text-neutral-100 transition-all hover:border-neutral-400 dark:hover:border-neutral-700"
      style={{ width: nodeWidth }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !-left-1.5 !bg-primary border-2 border-white dark:border-neutral-900"
      />

      <div className="flex items-center justify-between px-3 py-2 bg-neutral-100/80 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800">
        <span className="font-semibold text-xs tracking-tight">{data.label}</span>
        <span className="text-[10px] text-neutral-500 font-mono">
          {data.fields.length} {data.fields.length === 1 ? "field" : "fields"}
        </span>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 p-1">
        {data.fields.map((field, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-2.5 py-1 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rounded transition-colors"
          >
            <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[120px]">
              {field.name}
            </span>
            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-[90px] text-right">
              {field.type}
            </span>
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !-right-1.5 !bg-primary border-2 border-white dark:border-neutral-900"
      />
    </div>
  )
}

const nodeTypes = { dataModel: DataModelNode }

export default function DataModelFlow({
  entities,
}: {
  entities: DataModelEntity[]
}) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => (entities.length > 0 ? getLayoutedElements(entities) : { nodes: [], edges: [] }),
    [entities]
  )

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes)
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges)

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 p-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Entity Relationship Diagram
          </h2>
          <p className="text-xs text-neutral-500">
            Interactive schema topology and directional dependencies
          </p>
        </div>
        <div className="text-xs font-mono text-neutral-500">
          {entities.length} {entities.length === 1 ? "Entity" : "Entities"}
        </div>
      </div>

      <div className="h-[360px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="oklch(0.5 0.02 55 / 0.15)" gap={16} size={1} />
          <Controls className="!bg-white dark:!bg-neutral-900 !border-neutral-200 dark:!border-neutral-800 !shadow-sm !rounded-md" />
        </ReactFlow>
      </div>
    </div>
  )
}
