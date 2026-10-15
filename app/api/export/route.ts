import { NextResponse } from "next/server"
import type { ProjectBrief } from "@/lib/types"

export async function POST(req: Request) {
  try {
    const { brief, format = "markdown" } = (await req.json().catch(() => ({}))) as {
      brief: ProjectBrief
      format: "markdown" | "json" | "sql" | "cursorrules" | "openapi"
    }

    if (!brief) {
      return NextResponse.json(
        { error: "Missing project brief payload to export." },
        { status: 400 }
      )
    }

    const title = (brief.projectName || "project-brief").toLowerCase().replace(/\s+/g, "-")

    if (format === "json") {
      return new NextResponse(JSON.stringify(brief, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${title}.json"`,
        },
      })
    }

    if (format === "sql") {
      const sqlContent = `-- Database Schema for: ${brief.projectName || "Application"}
-- Generated on: ${new Date().toISOString()}

${brief.dataModel
  .map(
    (e) => `CREATE TABLE IF NOT EXISTS "${e.name.toLowerCase()}" (
${e.fields.map((f) => `    "${f.name}" ${f.type}`).join(",\n")}
);`
  )
  .join("\n\n")}

-- Index definitions:
${brief.dataModel
  .map(
    (e) =>
      `CREATE INDEX IF NOT EXISTS "idx_${e.name.toLowerCase()}_id" ON "${e.name.toLowerCase()}" ("id");`
  )
  .join("\n")}
`
      return new NextResponse(sqlContent, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${title}-schema.sql"`,
        },
      })
    }

    if (format === "cursorrules") {
      const cursorContent = `# Cursor Rules & AI Assistant Directives: ${brief.projectName || "Application"}

## Project Overview
${brief.summary}

## Architecture Guidelines
- Framework: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- Validation: Zod schemas on all client-server boundaries
- Data Access: Drizzle ORM with PostgreSQL

## Core Entities
${brief.dataModel
  .map((e) => `- ${e.name} (${e.fields.map((f) => f.name).join(", ")})`)
  .join("\n")}

## Route Contracts
${brief.routes.map((r) => `- \`${r.path}\`: ${r.description}`).join("\n")}

## Rules for Code Generation
1. Never generate mock placeholders or dead button handlers.
2. Always pair inputs with validation feedback.
3. Keep code modular, strictly typed, and readable.
`
      return new NextResponse(cursorContent, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename=".cursorrules"`,
        },
      })
    }

    // Default: Markdown
    const markdownContent = `# ${brief.projectName || "Project Specification"}

## Executive Summary
${brief.summary}

## Target Users
${brief.targetUsers.map((u) => `- ${u}`).join("\n")}

## Core Features
${brief.coreFeatures.map((f) => `- ${f}`).join("\n")}

## Technology Stack
${brief.techStack
  .map((cat) => `### ${cat.category}\n${cat.items.map((i) => `- ${i}`).join("\n")}`)
  .join("\n\n")}

## Route Topology
${brief.routes.map((r) => `- \`${r.path}\`: ${r.description}`).join("\n")}

## Relational Data Entities
${brief.dataModel
  .map(
    (e) => `### Entity: ${e.name}\n${e.fields.map((f) => `- \`${f.name}\`: ${f.type}`).join("\n")}`
  )
  .join("\n\n")}

## Phased Implementation Plan
${brief.buildPhases
  .map((p) => `### ${p.phase}\n${p.tasks.map((t) => `- [ ] ${t}`).join("\n")}`)
  .join("\n\n")}

## Risk & Mitigation Register
${brief.risks.map((r) => `- **Risk**: ${r.risk}\n  - **Mitigation**: ${r.mitigation}`).join("\n\n")}
`

    return new NextResponse(markdownContent, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${title}.md"`,
      },
    })
  } catch (error) {
    console.error("Export endpoint error:", error)
    return NextResponse.json(
      { error: "Failed to generate export file." },
      { status: 500 }
    )
  }
}
