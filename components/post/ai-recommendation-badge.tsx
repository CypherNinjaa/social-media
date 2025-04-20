import { Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AIRecommendationBadgeProps {
  reason?: string
}

export function AIRecommendationBadge({ reason }: AIRecommendationBadgeProps) {
  if (!reason) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center text-xs text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>AI Recommended</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
