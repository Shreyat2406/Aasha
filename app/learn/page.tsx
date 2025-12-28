"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Lock, Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

const learningModules = [
  {
    id: "1",
    title: "Phishing Basics",
    description: "Learn to identify and avoid phishing attacks",
    category: "Phishing",
    difficulty: "beginner" as const,
    points: 50,
    locked: false,
  },
  {
    id: "2",
    title: "Password Security",
    description: "Create and manage strong passwords",
    category: "Security",
    difficulty: "beginner" as const,
    points: 50,
    locked: false,
  },
  {
    id: "3",
    title: "Social Media Safety",
    description: "Stay safe on social media platforms",
    category: "Privacy",
    difficulty: "beginner" as const,
    points: 50,
    locked: false,
  },
  {
    id: "4",
    title: "Advanced Scam Detection",
    description: "Recognize sophisticated scam techniques",
    category: "Scams",
    difficulty: "intermediate" as const,
    points: 100,
    locked: true,
  },
  {
    id: "5",
    title: "Data Privacy",
    description: "Protect your personal information online",
    category: "Privacy",
    difficulty: "intermediate" as const,
    points: 100,
    locked: true,
  },
  {
    id: "6",
    title: "Malware Protection",
    description: "Understand and prevent malware infections",
    category: "Security",
    difficulty: "advanced" as const,
    points: 150,
    locked: true,
  },
]

export default function LearnPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState<string>("all")

  if (!user) {
    router.push("/auth")
    return null
  }

  const filteredModules = learningModules.filter((module) => {
    if (filter === "all") return true
    return module.difficulty === filter
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-success/10 text-success"
      case "intermediate":
        return "bg-warning/10 text-warning"
      case "advanced":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Learning Modules</h1>
          <p className="text-muted-foreground">
            Complete modules to earn points and level up your cyber safety knowledge
          </p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level {user.level}</p>
                <p className="text-2xl font-bold">{user.points} points</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next Level</p>
                <p className="text-lg font-semibold">{user.level * 100} points</p>
              </div>
            </div>
            <Progress value={user.points % 100} className="h-2" />
            <p className="text-sm text-muted-foreground">{100 - (user.points % 100)} points to next level</p>
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All Modules
          </Button>
          <Button variant={filter === "beginner" ? "default" : "outline"} onClick={() => setFilter("beginner")}>
            Beginner
          </Button>
          <Button variant={filter === "intermediate" ? "default" : "outline"} onClick={() => setFilter("intermediate")}>
            Intermediate
          </Button>
          <Button variant={filter === "advanced" ? "default" : "outline"} onClick={() => setFilter("advanced")}>
            Advanced
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <Card
              key={module.id}
              className={`relative ${module.locked ? "opacity-60" : "hover:border-primary transition-colors"}`}
            >
              {module.locked && (
                <div className="absolute top-4 right-4 z-10">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getDifficultyColor(module.difficulty)}>{module.difficulty}</Badge>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-semibold">{module.points}</span>
                  </div>
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{module.category}</span>
                  </div>

                  {module.locked ? (
                    <Button disabled className="w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Locked
                    </Button>
                  ) : (
                    <Link href={`/learn/${module.id}`}>
                      <Button className="w-full">Start Learning</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
