import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Search, MessageSquare, BookOpen, Award, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-primary/10">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">Stay Safe Online with AASHA</h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance mb-8">
            Your AI-powered companion for cyber safety. Detect scams, learn about online threats, and stay protected
            with intelligent threat analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/scan">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Search className="h-5 w-5" />
                Start Scanning
              </Button>
            </Link>
            <Link href="/learn">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto bg-transparent">
                <BookOpen className="h-5 w-5" />
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance">
            Powerful Features for Your Safety
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Scam Detector</CardTitle>
                <CardDescription>
                  Scan URLs, messages, and images to detect potential scams and phishing attempts with AI-powered
                  analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/scan">
                  <Button variant="ghost" className="w-full">
                    Try It Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-4">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>AI Safety Assistant</CardTitle>
                <CardDescription>
                  Chat with our AI assistant to get instant answers about cyber security, online safety, and threat
                  prevention.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/chat">
                  <Button variant="ghost" className="w-full">
                    Start Chatting
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-success/10 mb-4">
                  <BookOpen className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Learn & Earn</CardTitle>
                <CardDescription>
                  Complete interactive learning modules about cyber safety and earn points, badges, and level up your
                  knowledge.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/learn">
                  <Button variant="ghost" className="w-full">
                    Explore Modules
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10 mb-4">
                  <Award className="h-6 w-6 text-warning" />
                </div>
                <CardTitle>Gamified Experience</CardTitle>
                <CardDescription>
                  Track your progress, earn badges, and compete with friends while learning essential cyber safety
                  skills.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/profile">
                  <Button variant="ghost" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10 mb-4">
                  <Shield className="h-6 w-6 text-chart-2" />
                </div>
                <CardTitle>Real-time Protection</CardTitle>
                <CardDescription>
                  Get instant threat analysis powered by Google Gemini AI and Vision API for comprehensive security.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-3/10 mb-4">
                  <TrendingUp className="h-6 w-6 text-chart-3" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your learning journey, view scan history, and see your improvement over time with detailed
                  analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl mb-4">Ready to Get Started?</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join thousands of users staying safe online with AASHA
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                Create Free Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
