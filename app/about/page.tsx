import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About SocialSphere</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Our mission is to connect people and build communities in a positive digital environment.
          </p>
        </div>
      </header>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                SocialSphere was founded in 2025 with a simple but powerful vision: to create a social platform that
                prioritizes genuine connections and positive interactions. In a digital landscape often criticized for
                its negative effects on mental health and social cohesion, we set out to build something different.
              </p>
              <p>
                Our founders, a diverse team of technologists, designers, and social scientists, came together with a
                shared belief that social media could be better—more human, more authentic, and more beneficial to
                society. They combined their expertise to create a platform that encourages meaningful engagement rather
                than endless scrolling.
              </p>
              <p>
                What started as a small project has grown into a vibrant community of millions of users worldwide.
                Today, SocialSphere stands as a testament to our belief that technology can bring people together in
                ways that enhance our lives and strengthen our communities.
              </p>
              <p>
                As we continue to grow, our commitment to our core values remains unwavering. We're building a platform
                where authenticity is celebrated, privacy is respected, and every interaction has the potential to
                create real value in people's lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600 dark:text-blue-400"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Authenticity</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe in real connections between real people. Our platform is designed to encourage authentic
                self-expression and genuine interactions.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teal-600 dark:text-teal-400"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We respect your data and your right to control it. We're committed to industry-leading privacy practices
                and transparent data policies.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600 dark:text-purple-400"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're building spaces where people can find belonging, support, and connection around shared interests
                and experiences.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-pink-600 dark:text-pink-400"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Well-being</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We design with mental health in mind, creating features that promote positive interactions and
                discourage harmful behaviors.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-600 dark:text-amber-400"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Inclusivity</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're building a platform where everyone feels welcome, regardless of background, identity, or
                perspective.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600 dark:text-green-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're committed to creating a safe environment through thoughtful policies, responsive moderation, and
                user-friendly reporting tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Founder</h2>
          <div className="flex flex-col items-center max-w-3xl mx-auto">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-6">
              <img src="/developer1.jpg" alt="Vikash Kumar" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-semibold">Vikash Kumar</h3>
            <p className="text-lg text-purple-600 dark:text-purple-400 mb-4">Founder & CEO</p>
            <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mb-6">
              As the founder of SocialSphere, Vikash Kumar brings a passion for creating meaningful connections in the
              digital world. With a vision to build a platform that prioritizes authentic interactions and user
              well-being, Vikash leads the development of SocialSphere with a focus on innovation and community.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/CypherNinjaa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GitHub
              </a>
              <a
                href="mailto:contact@socialsphere.example"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join Our Journey</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of building the future of social networking. Join SocialSphere today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Sign Up Now
            </Button>
            <Link href="/careers">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} SocialSphere. All rights reserved.
          </p>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
