import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { moderateContent } from "@/lib/ai/content-moderation"

export async function POST(request: Request) {
  try {
    const { userId, contentType, contentId, content } = await request.json()

    // Validate request
    if (!userId || !contentType || !contentId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user session to verify the request
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Moderate content
    const result = await moderateContent(userId, contentType, contentId, content)

    return NextResponse.json(result || { isAppropriate: true })
  } catch (error: any) {
    console.error("Error in moderate-content API:", error)
    return NextResponse.json({ error: error.message || "Failed to moderate content" }, { status: 500 })
  }
}
