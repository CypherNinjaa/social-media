import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { aiService } from "@/lib/ai/ai-service"

export async function POST(request: Request) {
  try {
    const { userId, userQuery, chatHistory } = await request.json()

    // Validate request
    if (!userId || !userQuery) {
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

    // Get chatbot response
    const response = await aiService.getChatbotResponse(userId, userQuery, chatHistory || [])

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Error in chatbot API:", error)
    return NextResponse.json({ error: error.message || "Failed to get response" }, { status: 500 })
  }
}
