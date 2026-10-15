import { NextResponse } from "next/server"
import type { ProjectBrief } from "@/lib/types"

export async function POST(req: Request) {
  try {
    const { brief, target = "cursor" } = (await req.json().catch(() => ({}))) as {
      brief: ProjectBrief
      target: "cursor" | "claude" | "tdd" | "database" | "api"
    }

    if (!brief || !brief.summary) {
      return NextResponse.json(
        { error: "A valid project brief is required." },
        { status: 400 }
      )
    }

    let prompt = ""
    let title = ""
    let recommendedModel = "Claude 3.7 Sonnet / Cursor Agent"

    if (target === "cursor") {
      title = "Cursor Master Directive"
      recommendedModel = "Cursor (claude-3-7-sonnet / gpt-4o)"
      prompt = `# CURSOR SYSTEM DIRECTIVE: ${brief.projectName || "Application"}

You are a senior full-stack engineer building ${brief.projectName || "the application"}.
Review the architectural blueprint below before generating any code.

## Executive Vision
${brief.summary}

## Core Technologies
${brief.techStack.map((s) => `- ${s.category}: ${s.items.join(", ")}`).join("\n")}

## Required Database Entities
${brief.dataModel
  .map(
    (e) => `### Table: ${e.name.toLowerCase()}
${e.fields.map((f) => `- ${f.name} (${f.type})`).join("\n")}`
  )
  .join("\n\n")}

## Target Routes
${brief.routes.map((r) => `- ${r.path} -> ${r.description}`).join("\n")}

## Instructions
1. Scaffold clean directory structure using Next.js 15 App Router.
2. Implement schema files first with Zod validation.
3. Write clean, accessible UI components with zero dead clicks.
4. Ensure all database foreign keys have corresponding indexes.`
    } else if (target === "tdd") {
      title = "Test-Driven Development (TDD) Plan"
      recommendedModel = "Vitest / Playwright / Jest"
      prompt = `# TDD IMPLEMENTATION & TEST SPECIFICATION: ${brief.projectName || "Application"}

## Objective
Implement comprehensive unit, integration, and E2E tests before implementing business logic.

## Critical Test Suites
${brief.routes
  .map(
    (r) => `### Route Suite: ${r.path}
- [ ] Test 200 OK with valid session and valid payload
- [ ] Test 400 Bad Request with missing or invalid Zod fields
- [ ] Test 401/403 Unauthorized without proper session token
- [ ] Test 500 error boundary handling gracefully`
  )
  .join("\n\n")}

## Data Integrity Tests
${brief.dataModel
  .map(
    (e) => `### Entity Test: ${e.name}
- [ ] Verify primary key uniqueness
- [ ] Verify required field constraints: ${e.fields.map((f) => f.name).join(", ")}`
  )
  .join("\n\n")}`
    } else if (target === "database") {
      title = "PostgreSQL Migration & Drizzle Schema"
      recommendedModel = "Drizzle ORM / Prisma"
      prompt = `// Drizzle ORM Schema Specification
// Project: ${brief.projectName || "Application"}

import { pgTable, uuid, varchar, timestamp, text, integer } from 'drizzle-orm/pg-core';

${brief.dataModel
  .map(
    (e) => `export const ${e.name.toLowerCase()}s = pgTable('${e.name.toLowerCase()}s', {
${e.fields
  .map(
    (f) =>
      `  ${f.name.replace(/[^a-zA-Z0-9]/g, "_")}: ${
        f.type.toLowerCase().includes("uuid")
          ? "uuid('id').defaultRandom().primaryKey()"
          : f.type.toLowerCase().includes("int")
          ? `integer('${f.name}')`
          : f.type.toLowerCase().includes("time")
          ? `timestamp('${f.name}').defaultNow().notNull()`
          : `varchar('${f.name}', { length: 255 })`
      },`
  )
  .join("\n")}
});`
  )
  .join("\n\n")}`
    } else {
      title = "General Master Prompt"
      prompt = brief.starterPrompt
    }

    return NextResponse.json({
      title,
      target,
      recommendedModel,
      prompt,
      characterCount: prompt.length,
      estimatedTokens: Math.round(prompt.length / 4),
    })
  } catch (error) {
    console.error("Prompts endpoint error:", error)
    return NextResponse.json(
      { error: "Failed to generate prompt variant." },
      { status: 500 }
    )
  }
}
