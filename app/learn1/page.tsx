"use client"

import { useState,useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const quizData = {
  title: "Password Security Basics",
  questions: [
    {
      question: "What makes a strong password?",
      options: ["Your birthday", "A mix of letters, numbers, and symbols", "Your pet's name", "The word 'password'"],
      correctAnswer: 1,
    },
    {
      question: "How often should you change your passwords?",
      options: ["Never", "Once a year", "Every 3-6 months", "Every day"],
      correctAnswer: 2,
    },
    {
      question: "Is it safe to use the same password for multiple accounts?",
      options: [
        "Yes, it's easier to remember",
        "No, if one account is hacked, all are at risk",
        "Only for unimportant accounts",
        "Yes, if the password is strong",
      ],
      correctAnswer: 1,
    },
  ],
}

export default function Learn1Page() {
  const { user, updateUserPoints, updateUserStats } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)

 useEffect(() => {
   if (!user) router.push("/auth");
 }, [user, router]);
 
 if (!user) return null;

  const handleNext = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      completeQuiz(newAnswers)
    }
  }

  const completeQuiz = async (finalAnswers: number[]) => {
    const correctCount = finalAnswers.filter(
      (answer, index) => answer === quizData.questions[index].correctAnswer,
    ).length

    const score = correctCount
    const total = quizData.questions.length

    setShowResult(true)
    setQuizComplete(true)

    try {
      // Save to Firestore
      await addDoc(collection(db, "users", user.uid, "learningProgress"), {
        quizId: "learn1",
        quizTitle: quizData.title,
        score,
        totalQuestions: total,
        completedAt: serverTimestamp(),
      })

      // Update user stats
      await updateUserStats({
        quizzesCompleted: (user.stats?.quizzesCompleted || 0) + 1,
        modulesCompleted: (user.stats?.modulesCompleted || 0) + 1,
        correctAnswers: (user.stats?.correctAnswers || 0) + correctCount,
        totalQuestions: (user.stats?.totalQuestions || 0) + total,
      })

      // Award points
      await updateUserPoints(correctCount * 10)

      toast({
        title: "Quiz Completed!",
        description: `You scored ${score}/${total}. Earned ${correctCount * 10} points!`,
      })
    } catch (error) {
      console.error("Error saving quiz:", error)
      toast({
        title: "Error",
        description: "Failed to save quiz results",
        variant: "destructive",
      })
    }
  }

  const correctCount =
    answers.filter((answer, index) => answer === quizData.questions[index].correctAnswer).length +
    (selectedAnswer === quizData.questions[currentQuestion]?.correctAnswer ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{quizData.title}</h1>
          <p className="text-muted-foreground">Test your knowledge about password security</p>
        </div>

        {!showResult ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Question {currentQuestion + 1} of {quizData.questions.length}
                </CardTitle>
                <span className="text-sm font-medium">
                  {Math.round((currentQuestion / quizData.questions.length) * 100)}%
                </span>
              </div>
              <Progress value={(currentQuestion / quizData.questions.length) * 100} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">{quizData.questions[currentQuestion].question}</h2>

                <RadioGroup
                  value={selectedAnswer?.toString()}
                  onValueChange={(val) => setSelectedAnswer(Number.parseInt(val))}
                >
                  <div className="space-y-3">
                    {quizData.questions[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={handleNext} disabled={selectedAnswer === null} className="w-full">
                {currentQuestion < quizData.questions.length - 1 ? "Next Question" : "Submit Quiz"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl">Quiz Complete!</CardTitle>
              <CardDescription className="text-center">
                You scored {correctCount} out of {quizData.questions.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {quizData.questions.map((q, index) => {
                  const isCorrect = answers[index] === q.correctAnswer
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${isCorrect ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-1">{q.question}</p>
                          <p className="text-sm text-muted-foreground">Your answer: {q.options[answers[index]]}</p>
                          {!isCorrect && (
                            <p className="text-sm text-success mt-1">Correct: {q.options[q.correctAnswer]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  You earned <span className="font-semibold text-foreground">+{correctCount * 10} points</span> for
                  completing this quiz!
                </p>
              </div>

              <Button onClick={() => router.push("/learn")} className="w-full">
                Back to Learning
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
