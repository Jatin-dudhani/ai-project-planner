import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "ai-project-planner",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
      aiProvider: process.env.GEMINI_API_KEY ? "Google Gemini (gemini-3.1-flash-lite)" : "Deterministic Architect Engine",
      endpoints: [
        { path: "/api/generate", method: "POST", description: "Generate project brief from concept idea" },
        { path: "/api/refine", method: "POST", description: "Refine or expand sections of an existing brief" },
        { path: "/api/export", method: "POST", description: "Export brief into Markdown, JSON, SQL, or Cursor rules" },
        { path: "/api/validate", method: "POST", description: "Validate a project brief payload against schema" },
        { path: "/api/prompts", method: "POST", description: "Generate tailored AI coding assistant prompts" },
        { path: "/api/health", method: "GET", description: "Service health status and diagnostics" },
      ],
    },
    { status: 200 }
  )
}
