import { NextResponse } from "next/server"
import { projectBriefSchema } from "@/lib/zod-schema"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { valid: false, errors: ["Missing request body JSON."] },
        { status: 400 }
      )
    }

    const result = projectBriefSchema.safeParse(body)
    if (!result.success) {
      const formattedErrors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      )
      return NextResponse.json(
        {
          valid: false,
          errors: formattedErrors,
        },
        { status: 422 }
      )
    }

    return NextResponse.json(
      {
        valid: true,
        message: "Project brief passed all structural and type validations.",
        metrics: {
          routeCount: result.data.routes.length,
          entityCount: result.data.dataModel.length,
          featureCount: result.data.coreFeatures.length,
          phaseCount: result.data.buildPhases.length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Validation endpoint error:", error)
    return NextResponse.json(
      { valid: false, errors: ["Internal server error during validation."] },
      { status: 500 }
    )
  }
}
