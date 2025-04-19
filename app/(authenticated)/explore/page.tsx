import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function ExplorePage() {
  const supabase = createClient()

  // Get posts for explore page
  const { data: posts } = await supabase
    .from("posts")
    .select("id, image_url, user_id, profiles:user_id(username)")
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(30)

  // Create a grid layout with different sized items
  const gridItems =
    posts?.map((post, index) => {
      // Every 5th post is large, every 8th is wide, others are standard
      let sizeClass = "col-span-1 row-span-1"

      if (index % 5 === 0) {
        sizeClass = "col-span-2 row-span-2"
      } else if (index % 8 === 0) {
        sizeClass = "col-span-2 row-span-1"
      }

      return {
        ...post,
        sizeClass,
      }
    }) || []

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 auto-rows-min">
        {gridItems.map((item) => (
          <Link key={item.id} href={`/post/${item.id}`} className={`relative ${item.sizeClass} aspect-square group`}>
            <img
              src={item.image_url || "/placeholder.svg?height=300&width=300"}
              alt={`Post by ${item.profiles.username}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
              {/* Overlay content could go here */}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
