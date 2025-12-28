"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Award, Shield, TrendingUp, Target, BookOpen } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

const sampleBadges = [
  { id: "1", name: "First Scan", description: "Completed your first scan", icon: "🔍" },
  { id: "2", name: "Safety Student", description: "Completed 3 learning modules", icon: "📚" },
  { id: "3", name: "Chat Master", description: "Had 10 conversations with AASHA", icon: "💬" },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quizProgress, setQuizProgress] = useState<QuizProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchQuizProgress()
    }
  }, [user])

  const fetchQuizProgress = async () => {
    if (!user) return

    try {
      const q = query(collection(db!, "users", user.uid, "learningProgress"), orderBy("completedAt", "desc"))
      const querySnapshot = await getDocs(q)
      const progress: QuizProgress[] = []

      querySnapshot.forEach((doc) => {
        progress.push(doc.data() as QuizProgress)
      })

      setQuizProgress(progress)
    } catch (error) {
      console.error("Error fetching quiz progress:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push("/auth")
    return null
  }

  const progressToNextLevel = user.points % 100
  const pointsNeeded = 100 - progressToNextLevel

  const stats = user.stats || {
    scansCompleted: 0,
    modulesCompleted: 0,
    quizzesCompleted: 0,
    chatConversations: 0,
    correctAnswers: 0,
    totalQuestions: 0,
  }

  const quizAccuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user.displayName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <span className="text-2xl font-bold text-primary">{user.level}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                    <p className="text-lg font-semibold">Level {user.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold text-primary">{user.points}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to Level {user.level + 1}</span>
                  <span className="font-medium">{progressToNextLevel}/100</span>
                </div>
                <Progress value={progressToNextLevel} className="h-3" />
                <p className="text-sm text-muted-foreground">{pointsNeeded} points needed to reach next level</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scansCompleted}</div>
              <p className="text-xs text-muted-foreground">Threats analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.modulesCompleted}</div>
              <p className="text-xs text-muted-foreground">Learning progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quiz Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizAccuracy}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.correctAnswers}/{stats.totalQuestions} correct
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.badges.length}</div>
              <p className="text-xs text-muted-foreground">Achievements unlocked</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quiz Progress
            </CardTitle>
            <CardDescription>Your completed quizzes and scores</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Loading...</p>
            ) : quizProgress.length > 0 ? (
              <div className="space-y-3">
                {quizProgress.map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{quiz.quizTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed: {quiz.completedAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {quiz.score}/{quiz.totalQuestions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((quiz.score / quiz.totalQuestions) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No quizzes completed yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Badges & Achievements
            </CardTitle>
            <CardDescription>Earn badges by completing tasks and learning modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}

              {user.badges.length < sampleBadges.length && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-dashed border-border opacity-50">
                  <div className="text-3xl">🔒</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">More badges coming...</h3>
                    <p className="text-sm text-muted-foreground">Keep learning to unlock more!</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface QuizProgress {
  quizId: string
  quizTitle: string
  score: number
  totalQuestions: number
  completedAt: any
}
