import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

function analyzeThreatLevel(text: string): {
  threatLevel: "safe" | "low" | "medium" | "high" | "critical"
  score: number
  indicators: Array<{ type: string; severity: string; description: string }>
} {
  const lowerText = text.toLowerCase()
  const indicators: Array<{ type: string; severity: string; description: string }> = []
  let score = 0

  const criticalKeywords = ["extremely dangerous", "high risk", "critical threat", "immediate danger"]
  const highKeywords = ["dangerous", "threat", "warning", "avoid", "harmful"]
  const mediumKeywords = ["caution", "careful", "potential risk", "be aware"]
  const lowKeywords = ["minor concern", "low risk", "generally safe"]

  criticalKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      score += 25
      indicators.push({ type: "Critical", severity: "high", description: `Detected: ${keyword}` })
    }
  })

  highKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      score += 15
      indicators.push({ type: "High Risk", severity: "high", description: `Detected: ${keyword}` })
    }
  })

  mediumKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      score += 8
      indicators.push({ type: "Medium Risk", severity: "medium", description: `Detected: ${keyword}` })
    }
  })

  lowKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      score += 3
      indicators.push({ type: "Low Risk", severity: "low", description: `Detected: ${keyword}` })
    }
  })

  score = Math.min(score, 100)

  let threatLevel: "safe" | "low" | "medium" | "high" | "critical" = "safe"
  if (score >= 80) threatLevel = "critical"
  else if (score >= 60) threatLevel = "high"
  else if (score >= 30) threatLevel = "medium"
  else if (score >= 10) threatLevel = "low"

  return { threatLevel, score, indicators }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    const { threatLevel, score, indicators } = analyzeThreatLevel(text)

    return NextResponse.json({
      threatLevel,
      score,
      analysis: text,
      indicators,
    })
  } catch (error: any) {
    console.error("[v0] Error with Gemini API:", error)

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return NextResponse.json(
        {
          error: "API quota exceeded. Please wait a moment and try again, or upgrade your Gemini API plan.",
          quotaExceeded: true,
        },
        { status: 429 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to analyze with Gemini API. Please check your API key and try again.",
      },
      { status: 500 },
    )
  }
}
