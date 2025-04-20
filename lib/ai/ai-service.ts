import { XAI } from "@xai-org/xai-node"
import { createClient } from "@/lib/supabase/server"

// Initialize Grok client
const getXaiClient = () => {
  try {
    return new XAI({
      apiKey: process.env.XAI_API_KEY,
    })
  } catch (error) {
    console.error("Failed to initialize XAI client:", error)
    return null
  }
}

export interface ContentRecommendation {
  postId: string
  score: number
  reason: string
}

export interface SentimentAnalysis {
  sentiment: "positive" | "negative" | "neutral"
  score: number
  toxicity: number
  isAppropriate: boolean
}

export interface ContentGenerationPrompt {
  topic?: string
  tone?: string
  length?: "short" | "medium" | "long"
  includeHashtags?: boolean
  contentType?: "post" | "comment" | "bio"
}

export interface GeneratedContent {
  text: string
  hashtags?: string[]
}

export interface AIFeatureStatus {
  isEnabled: boolean
  usageCount: number
  lastUsed: string | null
}

/**
 * Check if an AI feature is available for a user
 */
export async function checkAIFeatureAvailability(userId: string, featureName: string): Promise<AIFeatureStatus> {
  const supabase = createClient()

  try {
    // Check if the feature exists for the user
    const { data, error } = await supabase
      .from("ai_feature_status")
      .select("is_enabled, usage_count, last_used")
      .eq("user_id", userId)
      .eq("feature_name", featureName)
      .single()

    if (error) {
      // If no record exists, create one with default values
      if (error.code === "PGRST116") {
        const { data: newData, error: insertError } = await supabase
          .from("ai_feature_status")
          .insert({
            user_id: userId,
            feature_name: featureName,
            is_enabled: true,
            usage_count: 0,
          })
          .select("is_enabled, usage_count, last_used")
          .single()

        if (insertError) {
          console.error("Error creating AI feature status:", insertError)
          return { isEnabled: false, usageCount: 0, lastUsed: null }
        }

        return {
          isEnabled: newData.is_enabled,
          usageCount: newData.usage_count,
          lastUsed: newData.last_used,
        }
      }

      console.error("Error checking AI feature availability:", error)
      return { isEnabled: false, usageCount: 0, lastUsed: null }
    }

    return {
      isEnabled: data.is_enabled,
      usageCount: data.usage_count,
      lastUsed: data.last_used,
    }
  } catch (error) {
    console.error("Error in checkAIFeatureAvailability:", error)
    return { isEnabled: false, usageCount: 0, lastUsed: null }
  }
}

/**
 * Update usage count for an AI feature
 */
export async function updateAIFeatureUsage(userId: string, featureName: string): Promise<void> {
  const supabase = createClient()

  try {
    await supabase
      .from("ai_feature_status")
      .update({
        usage_count: supabase.rpc("increment", { row_count: 1 }),
        last_used: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("feature_name", featureName)
  } catch (error) {
    console.error("Error updating AI feature usage:", error)
  }
}

/**
 * AI service for content recommendations, sentiment analysis, and content generation
 */
export const aiService = {
  /**
   * Get personalized content recommendations for a user
   */
  async getRecommendations(
    userId: string,
    userInterests: string[],
    recentInteractions: { postId: string; action: string }[],
    limit = 10,
  ): Promise<ContentRecommendation[]> {
    // Check if the feature is available
    const featureStatus = await checkAIFeatureAvailability(userId, "recommendations")
    if (!featureStatus.isEnabled) {
      return []
    }

    const xai = getXaiClient()
    if (!xai) {
      return []
    }

    try {
      const prompt = `
        As a content recommendation system, suggest ${limit} posts for a user with the following:
        - User interests: ${userInterests.join(", ")}
        - Recent interactions: ${JSON.stringify(recentInteractions)}
        
        Return a JSON array of objects with postId, score (0-1), and reason fields.
      `

      const response = await xai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "grok-1",
        response_format: { type: "json_object" },
      })

      const content = response.choices[0].message.content
      if (!content) throw new Error("Empty response from AI")

      const parsedContent = JSON.parse(content)
      const recommendations = parsedContent.recommendations || []

      // Update usage count
      await updateAIFeatureUsage(userId, "recommendations")

      return recommendations
    } catch (error) {
      console.error("Error getting AI recommendations:", error)
      return []
    }
  },

  /**
   * Analyze sentiment and appropriateness of content
   */
  async analyzeSentiment(userId: string, content: string): Promise<SentimentAnalysis> {
    // Check if the feature is available
    const featureStatus = await checkAIFeatureAvailability(userId, "moderation")
    if (!featureStatus.isEnabled) {
      return {
        sentiment: "neutral",
        score: 0.5,
        toxicity: 0,
        isAppropriate: true,
      }
    }

    const xai = getXaiClient()
    if (!xai) {
      return {
        sentiment: "neutral",
        score: 0.5,
        toxicity: 0,
        isAppropriate: true,
      }
    }

    try {
      const prompt = `
        Analyze the sentiment and appropriateness of the following content:
        "${content}"
        
        Return a JSON object with:
        - sentiment: "positive", "negative", or "neutral"
        - score: number between 0-1 indicating sentiment strength
        - toxicity: number between 0-1 indicating toxicity level
        - isAppropriate: boolean indicating if content is appropriate for general audience
      `

      const response = await xai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "grok-1",
        response_format: { type: "json_object" },
      })

      const responseContent = response.choices[0].message.content
      if (!responseContent) throw new Error("Empty response from AI")

      const result = JSON.parse(responseContent)

      // Update usage count
      await updateAIFeatureUsage(userId, "moderation")

      return result
    } catch (error) {
      console.error("Error analyzing sentiment:", error)
      return {
        sentiment: "neutral",
        score: 0.5,
        toxicity: 0,
        isAppropriate: true,
      }
    }
  },

  /**
   * Generate content based on user prompt
   */
  async generateContent(userId: string, prompt: ContentGenerationPrompt): Promise<GeneratedContent> {
    // Check if the feature is available
    const featureStatus = await checkAIFeatureAvailability(userId, "content_generation")
    if (!featureStatus.isEnabled) {
      return {
        text: "AI content generation is currently unavailable.",
        hashtags: [],
      }
    }

    const xai = getXaiClient()
    if (!xai) {
      return {
        text: "AI content generation is currently unavailable.",
        hashtags: [],
      }
    }

    try {
      const aiPrompt = `
        Generate a ${prompt.contentType || "post"} with the following characteristics:
        ${prompt.topic ? `- Topic: ${prompt.topic}` : ""}
        ${prompt.tone ? `- Tone: ${prompt.tone}` : ""}
        ${prompt.length ? `- Length: ${prompt.length}` : ""}
        ${prompt.includeHashtags ? "- Include relevant hashtags" : ""}
        
        Return a JSON object with:
        - text: the generated content
        - hashtags: array of hashtags (if requested)
      `

      const response = await xai.chat.completions.create({
        messages: [{ role: "user", content: aiPrompt }],
        model: "grok-1",
        response_format: { type: "json_object" },
      })

      const content = response.choices[0].message.content
      if (!content) throw new Error("Empty response from AI")

      const result = JSON.parse(content)

      // Update usage count
      await updateAIFeatureUsage(userId, "content_generation")

      // Store the generated content
      const supabase = createClient()
      await supabase.from("ai_generated_content").insert({
        user_id: userId,
        content_type: prompt.contentType || "post",
        prompt: JSON.stringify(prompt),
        generated_content: result.text,
      })

      return result
    } catch (error) {
      console.error("Error generating content:", error)
      return {
        text: "Sorry, I could not generate content at this time.",
        hashtags: [],
      }
    }
  },

  /**
   * Get a chatbot response for customer support
   */
  async getChatbotResponse(
    userId: string,
    userQuery: string,
    chatHistory: { role: string; content: string }[],
  ): Promise<string> {
    // Check if the feature is available
    const featureStatus = await checkAIFeatureAvailability(userId, "chatbot")
    if (!featureStatus.isEnabled) {
      return "The AI assistant is currently unavailable. Please contact support through email."
    }

    const xai = getXaiClient()
    if (!xai) {
      return "The AI assistant is currently unavailable. Please contact support through email."
    }

    try {
      const messages = [
        {
          role: "system",
          content: `You are SocialSphereBot, a helpful customer support assistant for the SocialSphere social media platform. 
          Be friendly, concise, and helpful. If you don't know something, say so politely.`,
        },
        ...chatHistory,
        { role: "user", content: userQuery },
      ]

      const response = await xai.chat.completions.create({
        messages,
        model: "grok-1",
      })

      const responseText =
        response.choices[0].message.content || "I apologize, but I could not process your request at this time."

      // Update usage count
      await updateAIFeatureUsage(userId, "chatbot")

      // Store the conversation
      const supabase = createClient()
      const conversationId = `${userId}-${Date.now()}`

      await supabase.from("chatbot_conversations").insert([
        {
          user_id: userId,
          conversation_id: conversationId,
          message: userQuery,
          is_user_message: true,
        },
        {
          user_id: userId,
          conversation_id: conversationId,
          message: responseText,
          is_user_message: false,
        },
      ])

      return responseText
    } catch (error) {
      console.error("Error getting chatbot response:", error)
      return "Sorry, I am having trouble connecting right now. Please try again later."
    }
  },
}
