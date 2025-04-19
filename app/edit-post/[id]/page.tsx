import { getPostById } from "@/app/actions/post"
import { EditPostForm } from "@/components/post/edit-post-form"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = params
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  // Fetch the post
  const post = await getPostById(id)

  // Check if post exists
  if (!post) {
    notFound()
  }

  // Check if the current user is the post owner
  if (post.user_id !== session.user.id) {
    redirect("/")
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <EditPostForm post={post} />
    </div>
  )
}
