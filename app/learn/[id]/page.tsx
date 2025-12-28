"use client"

import { useState, use } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Trophy } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { learningModules } from "@/lib/learning-data"

export default function LearnModulePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, updateUserPoints, updateUserStats } = useAuth()
  const router = useRouter()

  const module = learningModules.find((m) => m.id === resolvedParams.id)

  const [currentSection, setCurrentSection] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  if (!user) {
    router.push("/auth")
    return null
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>Module not found</AlertDescription>
          </Alert>
          <Link href="/learn">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalSections = module.content.length
  const hasQuiz = module.quiz && module.quiz.length > 0

  const handleNextSection = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1)
    } else if (hasQuiz) {
      setShowQuiz(true)
    }
  }

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowExplanation(false)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)
    setShowExplanation(true)

    setTimeout(() => {
      if (currentQuestion < module.quiz!.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)
      } else {
        completeQuiz(newAnswers)
      }
    }, 2000)
  }

  const completeQuiz = async (finalAnswers: number[]) => {
    const correctCount = finalAnswers.filter((answer, index) => answer === module.quiz![index].correctAnswer).length
    const score = Math.round((correctCount / module.quiz!.length) * 100)

    await updateUserPoints(module.points)
    await updateUserStats({
      modulesCompleted: (user.stats?.modulesCompleted || 0) + 1,
      quizAccuracy: score,
    })

    setQuizCompleted(true)
  }

  if (quizCompleted) {
    const correctCount = answers.filter((answer, index) => answer === module.quiz![index].correctAnswer).length
    const score = Math.round((correctCount / module.quiz!.length) * 100)

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="h-16 w-16 text-warning" />
              </div>
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
              <CardDescription>
                You scored {correctCount} out of {module.quiz!.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-5xl font-bold text-primary mb-2">{score}%</p>
                <Progress value={score} className="h-3" />
              </div>

              <Alert>
                <AlertDescription className="text-center">
                  You earned <span className="font-bold text-primary">{module.points} points</span> for completing this
                  module!
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Link href="/learn" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learning
                  </Button>
                </Link>
                <Link href="/profile" className="flex-1">
                  <Button className="w-full">
                    View Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showQuiz && hasQuiz) {
    const question = module.quiz![currentQuestion]
    const isCorrect = selectedAnswer === question.correctAnswer

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">
                Question {currentQuestion + 1} of {module.quiz!.length}
              </h2>
              <span className="text-sm text-muted-foreground">{answers.length} answered</span>
            </div>
            <Progress value={(currentQuestion / module.quiz!.length) * 100} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-balance">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
              >
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                      showExplanation
                        ? index === question.correctAnswer
                          ? "border-success bg-success/10"
                          : index === selectedAnswer
                            ? "border-destructive bg-destructive/10"
                            : "border-border"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showExplanation} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {showExplanation && index === question.correctAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                    {showExplanation && index === selectedAnswer && index !== question.correctAnswer && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                ))}
              </RadioGroup>

              {showExplanation && (
                <Alert variant={isCorrect ? "default" : "destructive"}>
                  <AlertDescription>
                    <span className="font-semibold">{isCorrect ? "Correct!" : "Incorrect."}</span>{" "}
                    {question.explanation}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || showExplanation}
                className="w-full"
              >
                {showExplanation ? "Loading next question..." : "Submit Answer"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentContent = module.content[currentSection]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/learn">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Learning
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
          <p className="text-muted-foreground">{module.description}</p>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{module.category}</span>
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm capitalize">
              {module.difficulty}
            </span>
            <span className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm">{module.points} pts</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Section {currentSection + 1} of {totalSections}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentSection + 1) / totalSections) * 100)}% complete
            </span>
          </div>
          <Progress value={((currentSection + 1) / totalSections) * 100} className="h-2" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {currentContent.type === "text" && <p className="text-base leading-relaxed">{currentContent.content}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button
            onClick={handlePreviousSection}
            disabled={currentSection === 0}
            variant="outline"
            className="flex-1 bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNextSection} className="flex-1">
            {currentSection === totalSections - 1 ? (hasQuiz ? "Start Quiz" : "Complete") : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
