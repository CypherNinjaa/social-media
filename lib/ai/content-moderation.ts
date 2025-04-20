import { createClient } from "@/lib/supabase/server"
import { aiService } from "@/lib/ai/ai-service"

export async function moderateContent(userId: string, contentType: string, contentId: string, content: string) {
  try {
    const supabase = createClient()

    // Check if content has already been moderated
    const { data: existingModeration } = await supabase
      .from("content_moderation")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .single()

    if (existingModeration) {
      return existingModeration
    }

    // Analyze content
    const analysis = await aiService.analyzeSentiment(userId, content)

    // Store moderation result
    const { data: moderation, error } = await supabase
      .from("content_moderation")
      .insert({
        content_type: contentType,
        content_id: contentId,
        sentiment: analysis.sentiment,
        sentiment_score: analysis.score,
        toxicity_score: analysis.toxicity,
        is_appropriate: analysis.isAppropriate,
      })
      .select()
      .single()

    if (error) {
      console.error("Error storing moderation result:", error)
    }

    // If content is inappropriate, take action
    if (!analysis.isAppropriate && analysis.toxicity > 0.8) {
      // For high toxicity content, hide it
      if (contentType === "post") {
        await supabase.from("posts").update({ is_hidden: true }).eq("id", contentId)
      } else if (contentType === "comment") {
        await supabase.from("comments").update({ is_hidden: true }).eq("id", contentId)
      }

      // Notify user
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "moderation",
        content: "Your content has been hidden due to violation of community guidelines.",
        is_read: false,
      })
    }

    return moderation || analysis
  } catch (error) {
    console.error("Error in content moderation:", error)
    return null
  }
}
