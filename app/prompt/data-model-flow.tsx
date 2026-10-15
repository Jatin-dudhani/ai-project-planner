"use client"

import { useMemo } from "react"
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
import { Database, Key, Link2, Hash } from "lucide-react"
import type { DataModelEntity } from "@/lib/types"

const nodeWidth = 250
const baseHeight = 76

function isPrimaryKey(fieldName: string, fieldType: string): boolean {
  return (
    fieldName.toLowerCase() === "id" ||
    fieldType.toUpperCase().includes("PK") ||
    fieldType.toUpperCase().includes("PRIMARY")
  )
}

function isForeignKey(fieldName: string, fieldType: string): boolean {
  if (isPrimaryKey(fieldName, fieldType)) return false
  return (
    fieldType.toUpperCase().includes("FK") ||
    (fieldName.toLowerCase().endsWith("id") && fieldName.length > 2)
  )
}

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
  const entityNames = new Set(entities.map((e) => e.name.toLowerCase()))
  const entityMap = new Map(entities.map((e) => [e.name.toLowerCase(), e.name]))
  const addedEdges = new Set<string>()

  // 1. Detect explicit or implicit foreign keys
  for (const entity of entities) {
    for (const field of entity.fields) {
      let targetEntity: string | null = null

      // Pattern 1: FK -> Target or FK -> Target.id
      const fkMatch = field.type.match(/FK\s*->\s*([A-Za-z0-9_]+)/i)
      if (fkMatch && entityNames.has(fkMatch[1].toLowerCase())) {
        targetEntity = entityMap.get(fkMatch[1].toLowerCase()) || null
      }

      // Pattern 2: TargetId (e.g. userId -> User, habitId -> Habit)
      if (!targetEntity && field.name.toLowerCase().endsWith("id") && field.name.length > 2) {
        const potentialTarget = field.name.slice(0, -2).toLowerCase()
        if (potentialTarget && entityNames.has(potentialTarget) && potentialTarget !== entity.name.toLowerCase()) {
          targetEntity = entityMap.get(potentialTarget) || null
        }
      }

      // Pattern 3: (FK -> Table) in field description
      if (!targetEntity) {
        const textToSearch = `${field.name} ${field.type}`.toLowerCase()
        for (const [lowerName, origName] of entityMap.entries()) {
          if (lowerName !== entity.name.toLowerCase() && textToSearch.includes(`-> ${lowerName}`)) {
            targetEntity = origName
            break
          }
        }
      }

      if (targetEntity && targetEntity !== entity.name) {
        const edgeId = `e-${targetEntity}-${entity.name}`
        if (!addedEdges.has(edgeId)) {
          addedEdges.add(edgeId)
          g.setEdge(targetEntity, entity.name)
          edges.push({
            id: edgeId,
            source: targetEntity,
            target: entity.name,
            animated: false,
            label: `${field.name}`,
            labelStyle: {
              fontSize: 10,
              fill: "#71717a",
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 500,
            },
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
            labelBgStyle: {
              fill: "#18181b",
              fillOpacity: 0.9,
            },
            style: { stroke: "#71717a", strokeWidth: 1.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#71717a",
              width: 14,
              height: 14,
            },
          })
        }
      }
    }
  }

  // Fallback to sequential chaining only if zero relational edges were detected and >= 2 entities
  if (edges.length === 0 && entities.length >= 2) {
    for (let i = 0; i < entities.length - 1; i++) {
      const from = entities[i].name
      const to = entities[i + 1].name
      g.setEdge(from, to)
      edges.push({
        id: `e-${from}-${to}`,
        source: from,
        target: to,
        animated: false,
        style: { stroke: "#71717a", strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#71717a",
          width: 14,
          height: 14,
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
      className="relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden text-zinc-950 dark:text-zinc-50 transition-colors hover:border-zinc-400 dark:hover:border-zinc-600"
      style={{ width: nodeWidth }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !-left-1.5 !bg-zinc-400 dark:!bg-zinc-600 !border-2 !border-white dark:!border-zinc-900 !rounded-full"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <Database className="size-3 text-zinc-500" />
          <span className="font-semibold text-xs tracking-tight font-mono">
            {data.label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          {data.fields.length}
        </span>
      </div>

      {/* Fields */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1">
        {data.fields.map((field, i) => {
          const isPK = isPrimaryKey(field.name, field.type)
          const isFK = isForeignKey(field.name, field.type)

          return (
            <div
              key={i}
              className="flex items-center justify-between px-2 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded transition-colors"
            >
              <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                {isPK ? (
                  <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                    PK
                  </span>
                ) : isFK ? (
                  <span className="text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    FK
                  </span>
                ) : (
                  <Hash className="size-2.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                )}
                <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 font-medium truncate">
                  {field.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-[95px] text-right">
                {field.type}
              </span>
            </div>
          )
        })}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !-right-1.5 !bg-zinc-400 dark:!bg-zinc-600 !border-2 !border-white dark:!border-zinc-900 !rounded-full"
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
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4 sm:p-5 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Entity Relationship Diagram
          </h2>
          <p className="text-xs text-zinc-500">
            Interactive schema topology and directional dependencies
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
          <span>{entities.length} {entities.length === 1 ? "Entity" : "Entities"}</span>
          <span>·</span>
          <span>Drag to arrange</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="h-[380px] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background color="#71717a" gap={20} size={1} className="opacity-15 dark:opacity-20" />
          <Controls className="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 !shadow-xs !rounded-md !text-zinc-700 dark:!text-zinc-300" />
        </ReactFlow>
      </div>
    </div>
  )
}
