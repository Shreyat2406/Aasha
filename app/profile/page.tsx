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

interface QuizProgress {
  quizId: string
  quizTitle: string
  score: number
  totalQuestions: number
  completedAt: any
}

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

  /* ✅ Redirect SAFELY */
  useEffect(() => {
    if (user === null) {
      router.replace("/auth")
    }
  }, [user, router])

  /* ✅ Fetch quiz progress */
  useEffect(() => {
    if (!user) return

    const fetchQuizProgress = async () => {
      try {
        const q = query(
          collection(db!, "users", user.uid, "learningProgress"),
          orderBy("completedAt", "desc")
        )

        const snapshot = await getDocs(q)
        const progress: QuizProgress[] = snapshot.docs.map(
          (doc) => doc.data() as QuizProgress
        )

        setQuizProgress(progress)
      } catch (err) {
        console.error("Error fetching quiz progress:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizProgress()
  }, [user])

  /* ⏳ Prevent render before auth resolved */
  if (!user) return null

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

  const quizAccuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
      : 0

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>

        {/* Profile Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{user.displayName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Level Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressToNextLevel} />
              <p className="text-sm text-muted-foreground">
                {pointsNeeded} points to reach next level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Scans" value={stats.scansCompleted} icon={<Shield />} />
          <StatCard title="Modules" value={stats.modulesCompleted} icon={<Target />} />
          <StatCard title="Accuracy" value={`${quizAccuracy}%`} icon={<TrendingUp />} />
          <StatCard title="Badges" value={user.badges.length} icon={<Award />} />
        </div>

        {/* Quiz Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <BookOpen className="h-5 w-5" /> Quiz Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : quizProgress.length === 0 ? (
              <p className="text-center text-muted-foreground">No quizzes yet</p>
            ) : (
              quizProgress.map((quiz, i) => (
                <div key={i} className="flex justify-between border rounded p-4 mb-2">
                  <div>
                    <p className="font-semibold">{quiz.quizTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {quiz.completedAt?.toDate?.()?.toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-primary">
                    {quiz.score}/{quiz.totalQuestions}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* Small stat card helper */
function StatCard({ title, value, icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
