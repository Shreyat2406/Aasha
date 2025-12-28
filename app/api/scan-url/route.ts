import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

// Local in-memory cache (for repeated URLs in the same server instance)
const cache = new Map<string, any>()

function analyzeThreatLevel(text: string) {
  const lowerText = text.toLowerCase()
  const indicators: Array<{ type: string; severity: string; description: string }> = []
  let score = 0

  const criticalKeywords = [
    "malware",
    "ransomware",
    "credential theft",
    "steal password",
    "phishing site",
    "fake login",
  ]
  const highKeywords = ["phishing", "scam", "suspicious", "malicious", "fraud", "deceptive", "dangerous"]
  const mediumKeywords = ["caution", "warning", "verify", "untrusted", "unsecure", "risk"]
  const lowKeywords = ["unusual", "uncommon", "check", "review"]

  criticalKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      score += 25
      indicators.push({ type: "Critical Threat", severity: "high", description: `Detected: ${keyword}` })
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

// Retry wrapper for Gemini API
async function generateWithRetry(model: any, prompt: string, retries = 3, delayMs = 2000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err: any) {
      if (attempt === retries - 1) throw err
      if (err.message?.includes("quota") || err.message?.includes("429")) {
        console.warn(`[Gemini] Rate limit hit. Retrying in ${delayMs}ms... (Attempt ${attempt + 1})`)
        await new Promise((r) => setTimeout(r, delayMs))
      } else {
        throw err
      }
    }
  }
  throw new Error("Failed to get response after retries")
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 })

    // Check cache first
    if (cache.has(url)) {
      console.log("[Cache] Returning cached result for:", url)
      return NextResponse.json(cache.get(url))
    }

    console.log("[v0] Sending request to Gemini API for URL:", url)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

    const prompt = `Analyze this URL for potential security threats, scams, or phishing attempts: ${url}

Provide a detailed analysis covering:
1. Whether the URL appears legitimate or suspicious
2. Any signs of phishing, scams, or malicious intent
3. Domain reputation and trustworthiness
4. Any red flags or warning signs
5. Recommendations for the user

Write your analysis in plain text, be thorough and specific.`

    const text = await generateWithRetry(model, prompt)

    const { threatLevel, score, indicators } = analyzeThreatLevel(text)

    const responseData = { threatLevel, score, analysis: text, indicators }

    // Cache result for future requests
    cache.set(url, responseData)

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("[v0] Error scanning URL:", error)

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return NextResponse.json(
        { error: "API quota exceeded. Try again later or upgrade your Gemini API plan.", quotaExceeded: true },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Failed to analyze URL. Please check your API key and try again." },
      { status: 500 }
    )
  }
}

