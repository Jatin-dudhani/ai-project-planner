"use client";

import type { ProjectBrief } from "./types";

const STORAGE_KEY = "ai-project-planner-brief";

let memoryCache: ProjectBrief | null = null;

export const SAMPLE_BRIEF: ProjectBrief = {
  projectName: "HabitFlow Gamified Planner",
  summary:
    "A gamified daily habit and wellness tracker designed to help busy knowledge workers build consistent daily routines through XP levels, streak rewards, and visual milestone maps.",
  targetUsers: [
    "Remote Knowledge Workers & Developers",
    "Self-Improvement Enthusiasts",
    "Productivity & Wellness Coaches"
  ],
  coreFeatures: [
    "Interactive Habit Dashboard with one-tap completion logs",
    "Streak Progression Engine with XP points and leveling system",
    "Weekly & Monthly Telemetry Analytics with visual heatmaps",
    "Custom Routine Bundles (Morning Routine, Deep Work, Evening Wind-Down)",
    "Markdown & CSV Data Export for offline journaling"
  ],
  techStack: [
    { category: "Frontend", items: ["Next.js 15 (App Router)", "TypeScript", "Tailwind CSS v4", "Lucide React"] },
    { category: "Backend & API", items: ["Next.js Route Handlers", "Zod Validation", "Node.js 22"] },
    { category: "Database & Storage", items: ["PostgreSQL", "Drizzle ORM", "Redis Cache"] },
    { category: "Authentication", items: ["Auth.js / NextAuth", "Session JWTs", "Role-Based Access"] },
    { category: "Deployment", items: ["Docker", "Google Cloud Run / Vercel", "GitHub Actions"] }
  ],
  routes: [
    { path: "/", description: "Product overview, feature showcase, and quick onboarding" },
    { path: "/auth/login", description: "Email passwordless login and account authentication" },
    { path: "/dashboard", description: "Daily habits checklist, current streak counters, and active challenges" },
    { path: "/analytics", description: "Long-term adherence trends, completion heatmaps, and XP metrics" },
    { path: "/settings", description: "Notification preferences, timezones, and data export" }
  ],
  dataModel: [
    {
      name: "User",
      fields: [
        { name: "id", type: "UUID (Primary Key)" },
        { name: "email", type: "VARCHAR(255)" },
        { name: "displayName", type: "VARCHAR(80)" },
        { name: "xpLevel", type: "INTEGER (Default: 1)" },
        { name: "createdAt", type: "TIMESTAMP" }
      ]
    },
    {
      name: "Habit",
      fields: [
        { name: "id", type: "UUID (Primary Key)" },
        { name: "userId", type: "UUID (FK -> User.id)" },
        { name: "title", type: "VARCHAR(120)" },
        { name: "cadence", type: "ENUM('DAILY', 'WEEKLY')" },
        { name: "targetStreak", type: "INTEGER" }
      ]
    },
    {
      name: "HabitLog",
      fields: [
        { name: "id", type: "UUID (Primary Key)" },
        { name: "habitId", type: "UUID (FK -> Habit.id)" },
        { name: "completedAt", type: "TIMESTAMP" },
        { name: "earnedXP", type: "INTEGER" }
      ]
    }
  ],
  buildPhases: [
    {
      phase: "Phase 1: Foundation & Data Schema",
      tasks: [
        "Initialize Next.js App Router project with TypeScript and Tailwind CSS v4",
        "Define Drizzle database schema with PostgreSQL connection",
        "Set up user authentication and protected session middleware",
        "Create responsive layout with theme switching and sidebar"
      ]
    },
    {
      phase: "Phase 2: Core Interactive Habit Workbench",
      tasks: [
        "Build daily habits checklist with instant optimistic updates",
        "Develop streak calculation engine with streak freeze safeguards",
        "Implement XP reward algorithm and level celebration banners",
        "Add weekly calendar view with completion indicators"
      ]
    },
    {
      phase: "Phase 3: Analytics & Export Polish",
      tasks: [
        "Build analytics view with monthly completion heatmaps",
        "Implement JSON and Markdown data export features",
        "Conduct performance optimization and Lighthouse audit",
        "Deploy to production environment with automated CI checks"
      ]
    }
  ],
  risks: [
    {
      risk: "Timezone drift corrupting midnight streak resets",
      mitigation: "Store all logs in UTC with the user's localized IANA timezone stored in their profile."
    },
    {
      risk: "Optimistic UI out of sync with database state on intermittent networks",
      mitigation: "Implement rollback mechanisms and retry queues with visible offline indicators."
    },
    {
      risk: "Complex aggregation queries slowing down dashboard load times",
      mitigation: "Pre-aggregate streak stats into a denormalized user stats table updated via background triggers."
    }
  ],
  starterPrompt: `# PROJECT STARTER PROMPT: HabitFlow Gamified Planner

## Objective
Build HabitFlow, a production-grade full-stack habit tracking web application built with Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS.

## Architecture
- Framework: Next.js 15 (App Router, Server Actions, Route Handlers)
- Styling: Tailwind CSS v4, Lucide React icons
- Database: PostgreSQL with Drizzle ORM
- Auth: NextAuth / Auth.js with session cookies

## Core Entities
- User (id, email, displayName, xpLevel, createdAt)
- Habit (id, userId, title, cadence, targetStreak)
- HabitLog (id, habitId, completedAt, earnedXP)

## Step-by-Step Implementation Instructions
1. Setup database models in \`src/db/schema.ts\` using Drizzle ORM.
2. Build client & server validation schemas using Zod in \`src/lib/validations.ts\`.
3. Create the responsive dashboard layout in \`app/dashboard/page.tsx\`.
4. Implement habit CRUD operations and streak calculation with optimistic UI feedback.
5. Provide data export to Markdown and JSON.`
};

export function saveBrief(brief: ProjectBrief): void {
  memoryCache = brief;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brief));
  } catch {
    // Memory cache already set
  }
}

export function loadBrief(): ProjectBrief | null {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProjectBrief;
        if (parsed) {
          memoryCache = parsed;
          return parsed;
        }
      }
    } catch {
      // Continue to memory cache
    }
  }
  return memoryCache;
}

export function loadBriefOrSample(): ProjectBrief {
  const existing = loadBrief();
  if (existing) return existing;
  return memoryCache || SAMPLE_BRIEF;
}

export function clearBrief(): void {
  memoryCache = null;
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
