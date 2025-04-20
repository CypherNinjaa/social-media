import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { aiService } from "@/lib/ai/ai-service"

export async function POST(request: Request) {
  try {
    const { userId, prompt } = await request.json()

    // Validate request
    if (!userId || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user session to verify the request
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate content
    const generatedContent = await aiService.generateContent(userId, prompt)

    return NextResponse.json(generatedContent)
  } catch (error: any) {
    console.error("Error in generate-content API:", error)
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 })
  }
}
