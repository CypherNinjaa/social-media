import Link from "next/link"
import Image from "next/image"

interface PostGridProps {
  posts: any[]
}

export function PostGrid({ posts }: PostGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post) => (
        <Link key={post.id} href={`/post/${post.id}`} className="aspect-square relative group">
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            {post.image_url ? (
              <Image
                src={post.image_url || "/placeholder.svg"}
                alt="Post"
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-xs p-2 text-center overflow-hidden line-clamp-4">{post.content}</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
