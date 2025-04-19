import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PostNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The post you're looking for doesn't exist or you don't have permission to edit it.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}
