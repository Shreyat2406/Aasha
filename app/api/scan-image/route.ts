import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

async function generateWithRetry(
  model: any,
  prompt: any,
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

  if (t.includes("malware") || t.includes("fake login")) score += 40
  if (t.includes("phishing") || t.includes("scam")) score += 25
  if (t.includes("suspicious")) score += 15

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
    const formData = await req.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 })
    }

    const buffer = Buffer.from(await image.arrayBuffer())
    const base64Image = buffer.toString("base64")

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

    const prompt = [
      `
Analyze this image for cybersecurity risks.

Return ONLY bullet points.
If safe, clearly say "No threats detected".

Check for:
- Fake login pages
- Scam messages
- QR phishing
- Suspicious payment requests
`,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
    ]

    const text = await generateWithRetry(model, prompt)

    const analysis = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-"))
      .map((l) => l.replace(/^-\s*/, ""))

    const { threatLevel, score } = analyzeThreat(text)

    return NextResponse.json({
      threatLevel,
      score,
      analysis: analysis.length ? analysis : ["No threats detected"],
      indicators: [],
    })
  } catch (err: any) {
    console.error("scan-img error:", err)

    return NextResponse.json(
      {
        threatLevel: "medium",
        score: 50,
        analysis: ["Failed to analyze image. Please try again."],
        indicators: [],
      },
      { status: 500 }
    )
  }
}
