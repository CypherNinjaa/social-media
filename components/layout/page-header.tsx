"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageHeaderProps {
  title: string
  description?: string
  showBackButton?: boolean
  backUrl?: string
}

export function PageHeader({ title, description, showBackButton = true, backUrl = "/" }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-2">
          {showBackButton && (
            <button
              onClick={() => (backUrl ? router.push(backUrl) : router.back())}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </button>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">{description}</p>}
        </div>
      </div>
    </div>
  )
}
