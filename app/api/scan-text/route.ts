import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

async function generateWithRetry(
  model: any,
  prompt: string,
  retries = 3,
  delayMs = 2000
) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err: any) {
      if (
        (err.message?.includes("quota") || err.message?.includes("429")) &&
        i < retries - 1
      ) {
        await new Promise((r) => setTimeout(r, delayMs))
        continue
      }
      throw err
    }
  }
  throw new Error("Failed after retries")
}

/* -------- STRICT THREAT SCORING -------- */
function analyzeThreat(text: string) {
  const t = text.toLowerCase()
  let score = 0

  if (t.includes("credential theft") || t.includes("account suspended"))
    score += 40
  if (t.includes("phishing") || t.includes("scam")) score += 25
  if (t.includes("urgent") || t.includes("click here")) score += 15

  score = Math.min(score, 100)

  let threatLevel: "safe" | "low" | "medium" | "high" | "critical" = "safe"
  if (score >= 80) threatLevel = "critical"
  else if (score >= 60) threatLevel = "high"
  else if (score >= 30) threatLevel = "medium"
  else if (score >= 10) threatLevel = "low"

  return { threatLevel, score }
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

    const prompt = `
Analyze this message for scams or phishing:

"${text}"

Return ONLY bullet points.
If safe, clearly say "No threats detected".
`

    const responseText = await generateWithRetry(model, prompt)

    const analysis = responseText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-"))
      .map((l) => l.replace(/^-\s*/, ""))

    const { threatLevel, score } = analyzeThreat(responseText)

    return NextResponse.json({
      threatLevel,
      score,
      analysis: analysis.length ? analysis : ["No threats detected"],
      indicators: [],
    })
  } catch (err: any) {
    console.error("scan-text error:", err)

    return NextResponse.json(
      {
        threatLevel: "medium",
        score: 50,
        analysis: ["Failed to analyze text. Please try again."],
        indicators: [],
      },
      { status: 500 }
    )
  }
}
