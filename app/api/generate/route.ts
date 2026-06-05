import { generateObject } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { projectBriefSchema } from "@/lib/zod-schema"
import { NextResponse } from "next/server"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
})

export async function POST(req: Request) {
  try {
    const { idea } = await req.json()

    if (!idea || typeof idea !== "string" || idea.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a detailed app idea (at least 10 characters)." },
        { status: 400 }
      )
    }

    const result = await generateObject({
      model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
      schema: projectBriefSchema,
      prompt: `You are an expert software architect. Given the following app idea, generate a comprehensive project brief.

App Idea: "${idea}"

Generate a detailed project brief with:
1. summary - A 2-3 sentence overview of the app
2. targetUsers - Array of target user groups/personas
3. coreFeatures - Array of key features
4. techStack - Array of objects with category and items (e.g., {category: "Frontend", items: ["React", "Tailwind"]})
5. routes - Array of route objects with path and description
6. dataModel - Array of entity objects with name and fields array (each field has name and type)
7. buildPhases - Array of phase objects with phase name and tasks array
8. risks - Array of risk objects with risk and mitigation
9. starterPrompt - A detailed prompt an AI coding assistant would need to start building this project

Make the response practical, specific, and actionable.`,
    })

    if (!result.object) {
      return NextResponse.json(
        { error: "Failed to generate project brief. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(result.object)
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json(
      { error: "An error occurred while generating the brief. Please try again." },
      { status: 500 }
    )
  }
}
