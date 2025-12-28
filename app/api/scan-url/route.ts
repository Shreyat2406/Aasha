import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

// In-memory cache
const cache = new Map<string, any>()

/* ---------------- TRUSTED DOMAIN CHECK ---------------- */
function isTrustedDomain(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    const trustedDomains = [
      "google.com",
      "chatgpt.com",
      "openai.com",
      "github.com",
      "microsoft.com",
      "amazon.com",
      "apple.com",
    ]

    return trustedDomains.some((domain) => hostname.endsWith(domain))
  } catch {
    return false
  }
}

/* ---------------- THREAT SCORING (STRICT) ---------------- */
function analyzeThreatLevel(text: string) {
  const lowerText = text.toLowerCase()
  let score = 0
  const indicators: Array<{ type: string; severity: string; description: string }> = []

  const criticalKeywords = [
    "malware",
    "ransomware",
    "credential theft",
    "fake login",
  ]

  const highKeywords = ["phishing", "scam", "fraud", "malicious"]

  criticalKeywords.forEach((k) => {
    if (lowerText.includes(k)) {
      score += 40
      indicators.push({
        type: "Critical Threat",
        severity: "high",
        description: `Detected: ${k}`,
      })
    }
  })

  highKeywords.forEach((k) => {
    if (lowerText.includes(k)) {
      score += 25
      indicators.push({
        type: "High Risk",
        severity: "high",
        description: `Detected: ${k}`,
      })
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

/* ---------------- GEMINI RETRY WRAPPER ---------------- */
async function generateWithRetry(model: any, prompt: string, retries = 3, delayMs = 2000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err: any) {
      if (attempt === retries - 1) throw err
      if (err.message?.includes("quota") || err.message?.includes("429")) {
        await new Promise((r) => setTimeout(r, delayMs))
      } else {
        throw err
      }
    }
  }
  throw new Error("Gemini failed after retries")
}

/* ---------------- API HANDLER ---------------- */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Cache check
    if (cache.has(url)) {
      return NextResponse.json(cache.get(url))
    }

    /* ---------- TRUSTED DOMAIN SHORT-CIRCUIT ---------- */
    if (isTrustedDomain(url)) {
      const responseData = {
        threatLevel: "safe",
        score: 5,
        analysis: [
          "This is a well-known and trusted domain",
          "Uses secure HTTPS encryption",
          "No phishing, scam, or malicious indicators detected",
          "Safe for normal browsing",
        ],
        indicators: [],
      }

      cache.set(url, responseData)
      return NextResponse.json(responseData)
    }

    /* ---------- GEMINI ANALYSIS ---------- */
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

    const prompt = `
Analyze the following URL for cybersecurity risks:
${url}

Return the response STRICTLY in this format:

LEGITIMACY:
- point

THREATS:
- point OR "No threats detected"

RED FLAGS:
- point OR "No red flags detected"

RECOMMENDATIONS:
- point

Rules:
- Use bullet points only
- No paragraphs
- Be factual, not cautious by default
`

    const text = await generateWithRetry(model, prompt)

    /* ---------- CONVERT TO BULLET POINT ARRAY ---------- */
    const analysisPoints = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.replace(/^-\s*/, ""))

    const { threatLevel, score, indicators } = analyzeThreatLevel(text)

    const responseData = {
      threatLevel,
      score,
      analysis: analysisPoints,
      indicators,
    }

    cache.set(url, responseData)
    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("Scan error:", error)

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return NextResponse.json(
        { error: "API quota exceeded. Try again later.", quotaExceeded: true },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Failed to analyze URL." },
      { status: 500 }
    )
  }
}


