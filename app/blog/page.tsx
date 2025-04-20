export default function BlogPage() {
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Introducing SocialSphere: A New Way to Connect",
      excerpt: "Learn about our mission to create a more authentic and positive social media experience.",
      author: "Alex Johnson",
      date: "April 15, 2023",
      category: "Company News",
      image: "/rising-network.png",
    },
    {
      id: 2,
      title: "5 Tips for Building a Genuine Online Community",
      excerpt: "Discover strategies for creating meaningful connections in digital spaces.",
      author: "Samantha Chen",
      date: "May 2, 2023",
      category: "Community Building",
      image: "/interconnected-digital-community.png",
    },
    {
      id: 3,
      title: "The Future of Social Media: Trends to Watch",
      excerpt: "Explore emerging technologies and cultural shifts shaping the next generation of social platforms.",
      author: "Marcus Williams",
      date: "May 18, 2023",
      category: "Industry Insights",
      image: "/interconnected-future.png",
    },
    {
      id: 4,
      title: "Digital Wellbeing: Finding Balance in a Connected World",
      excerpt: "Practical advice for maintaining healthy relationships with technology and social media.",
      author: "Priya Patel",
      date: "June 7, 2023",
      category: "Digital Wellbeing",
      image: "/balanced-digital-life.png",
    },
    {
      id: 5,
      title: "Behind the Design: Creating an Inclusive User Experience",
      excerpt: "Our design team shares insights on building accessible and welcoming digital spaces.",
      author: "Elena Rodriguez",
      date: "June 23, 2023",
      category: "Design",
      image: "/abstract-geometric-shapes.png",
    },
    {
      id: 6,
      title: "Community Spotlight: Amazing Stories from SocialSphere Users",
      excerpt: "Highlighting the creative ways our users are building connections on our platform.",
      author: "David Kim",
      date: "July 10, 2023",
      category: "Community Stories",
      image: "/connected-world-blog.png",
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">SocialSphere Blog</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Insights, updates, and stories from our team and community.
          </p>
        </div>
      </header>

      {/* Featured Post */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-xl overflow-hidden">
              <img src="/connected-world-blog.png" alt="Featured post" className="w-full h-80 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                <span className="text-teal-400 font-medium mb-2">Featured Post</span>
                <h2 className="text-3xl font-bold text-white mb-2">
                  The Evolution of Social Media: Where We're Headed
                </h2>
                <p className="text-white/80 mb-4">
                  An in-depth look at how social platforms are changing and what it means for users and society.
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img src="/confident-professional.png" alt="Author" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Alex Johnson</p>
                    <p className="text-white/70 text-sm">March 28, 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Latest Articles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg?height=200&width=400&query=blog post"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-2">
                    <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img src="/diverse-professional-profiles.png" alt={post.author} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium">{post.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Subscribe to our newsletter to receive the latest updates, articles, and insights from our team.
          </p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} SocialSphere. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Home
            </a>
            <a href="/about" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              About
            </a>
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
