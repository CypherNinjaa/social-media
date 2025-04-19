import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function EditPostLoading() {
  return (
    <div className="container max-w-2xl py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <Card>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
