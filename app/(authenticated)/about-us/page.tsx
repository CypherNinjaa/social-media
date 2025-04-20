import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Twitter, Linkedin, Globe, Heart, Mail } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-10">
      <PageHeader title="About SocialSphere" description="Our mission and the team behind the platform" />

      {/* Mission section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
        <Card>
          <CardContent className="p-6">
            <p className="mb-4">
              SocialSphere was created with a simple but powerful vision: to build a social platform that prioritizes
              genuine connections and positive interactions. In a digital landscape often criticized for its negative
              effects on mental health and social cohesion, we set out to create something different.
            </p>
            <p className="mb-4">
              Our platform is designed to encourage meaningful engagement rather than endless scrolling. We believe in
              creating spaces where authenticity is celebrated, privacy is respected, and every interaction has the
              potential to create real value in people's lives.
            </p>
            <p>
              As we continue to grow, our commitment to our core values remains unwavering. We're building a platform
              where you can connect with friends, share your experiences, and discover content that matters to you.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Values section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Authenticity</h3>
              <p className="text-sm text-muted-foreground">
                We believe in real connections between real people. Our platform is designed to encourage authentic
                self-expression and genuine interactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                  className="h-6 w-6 text-primary"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Privacy</h3>
              <p className="text-sm text-muted-foreground">
                We respect your data and your right to control it. We're committed to industry-leading privacy practices
                and transparent data policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
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
                  className="h-6 w-6 text-primary"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                We're building spaces where people can find belonging, support, and connection around shared interests
                and experiences.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Developer section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">About the Developer</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                <img src="/developer1.jpg" alt="Developer" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">CypherNinja</h3>
                <p className="mb-4 text-muted-foreground">
                  SocialSphere is developed by CypherNinja, a passionate developer focused on creating meaningful social
                  experiences on the web.
                </p>
                <p className="mb-6">
                  With a background in web development and a keen interest in user experience, CypherNinja built
                  SocialSphere to demonstrate how modern web technologies can be used to create engaging social
                  platforms.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://github.com/CypherNinjaa"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="#" className="flex items-center">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="#" className="flex items-center">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="#" className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
        <Card>
          <CardContent className="p-6">
            <p className="mb-4">
              Have questions, suggestions, or feedback? We'd love to hear from you! You can reach out to us through the
              following channels:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>
                  Email:{" "}
                  <a href="mailto:contact@socialsphere.example.com" className="text-primary hover:underline">
                    contact@socialsphere.example.com
                  </a>
                </span>
              </li>
              <li className="flex items-center">
                <Twitter className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>
                  Twitter:{" "}
                  <a href="#" className="text-primary hover:underline">
                    @SocialSphere
                  </a>
                </span>
              </li>
            </ul>
            <Button asChild>
              <Link href="/support">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
