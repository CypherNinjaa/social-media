import { Lock, Globe, Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PrivacyIndicatorProps {
  visibility: "public" | "followers" | "private"
}

export function PrivacyIndicator({ visibility }: PrivacyIndicatorProps) {
  let icon
  let label
  let description

  switch (visibility) {
    case "private":
      icon = <Lock className="h-4 w-4" />
      label = "Private Account"
      description = "Only approved followers can see this profile"
      break
    case "followers":
      icon = <Users className="h-4 w-4" />
      label = "Followers Only"
      description = "Only followers can see this profile"
      break
    case "public":
    default:
      icon = <Globe className="h-4 w-4" />
      label = "Public Account"
      description = "Anyone can see this profile"
      break
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-1 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
