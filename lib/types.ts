export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  points: number
  level: number
  badges: Badge[]
  stats?: {
    scansCompleted: number
    modulesCompleted: number
    quizzesCompleted: number
    chatConversations: number
    correctAnswers: number
    totalQuestions: number
    quizAccuracy?: number;
  }
  completedModules?: string[] // IDs of completed learning modules
  createdAt: Date
  lastActive: Date
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: Date
}

export interface ThreatAnalysis {
  id: string
  userId: string
  type: "url" | "text" | "image"
  content: string
  threatLevel: "safe" | "low" | "medium" | "high" | "critical"
  score: number
  analysis: string
  indicators: ThreatIndicator[]
  createdAt: Date
}

export interface ThreatIndicator {
  type: string
  severity: "low" | "medium" | "high"
  description: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface LearningModule {
  id: string
  title: string
  description: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  points: number
  content: ModuleContent[]
  quiz: QuizQuestion[]
  completed?: boolean
}

export interface ModuleContent {
  type: "text" | "image" | "video"
  content: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface ScanHistory {
  id: string
  userId: string
  type: "url" | "text" | "image"
  result: ThreatAnalysis
  timestamp: Date
}
