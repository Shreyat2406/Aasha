import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

// Retry wrapper
async function generateWithRetry(model: any, prompt: string, retries = 3, delayMs = 2000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (err: any) {
      if ((err.message?.includes("quota") || err.message?.includes("429")) && attempt < retries - 1) {
        console.warn(`[Gemini] Rate limit hit. Retrying in ${delayMs}ms... (Attempt ${attempt + 1})`)
        await new Promise((r) => setTimeout(r, delayMs))
        continue
      }
      throw err
    }
  }
  throw new Error("Failed to get response after retries")
}

// Analyze threat based on keywords
function analyzeThreatLevel(text: string) {
  const lowerText = text.toLowerCase()
  const indicators: Array<{ type: string; severity: string; description: string }> = []
  let score = 0

  const criticalKeywords = ["malware","ransomware","credential theft","steal password","urgent payment","account suspended"]
  const highKeywords = ["phishing","scam","suspicious","fraud","verify account","click here immediately","prize winner"]
  const mediumKeywords = ["urgent","act now","limited time","confirm","verify","unusual activity"]
  const lowKeywords = ["promotion","offer","deal","discount"]

  criticalKeywords.forEach(k => { if(lowerText.includes(k)){ score+=25; indicators.push({type:"Critical Threat", severity:"high", description:`Detected: ${k}`}) } })
  highKeywords.forEach(k => { if(lowerText.includes(k)){ score+=15; indicators.push({type:"High Risk", severity:"high", description:`Detected: ${k}`}) } })
  mediumKeywords.forEach(k => { if(lowerText.includes(k)){ score+=8; indicators.push({type:"Medium Risk", severity:"medium", description:`Detected: ${k}`}) } })
  lowKeywords.forEach(k => { if(lowerText.includes(k)){ score+=3; indicators.push({type:"Low Risk", severity:"low", description:`Detected: ${k}`}) } })

  score = Math.min(score, 100)

  let threatLevel: "safe"|"low"|"medium"|"high"|"critical" = "safe"
  if(score>=80) threatLevel="critical"
  else if(score>=60) threatLevel="high"
  else if(score>=30) threatLevel="medium"
  else if(score>=10) threatLevel="low"

  return { threatLevel, score, indicators }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    if(!text) return NextResponse.json({ error:"Text is required"},{status:400})

    const model = genAI.getGenerativeModel({ model:"gemini-flash-latest" })
    const prompt = `Analyze this message for scams, phishing, or malicious content: "${text}"
Provide detailed analysis including urgency tactics, requests for info/money, grammar/spelling, overall assessment.`

    const responseText = await generateWithRetry(model, prompt)
    const { threatLevel, score, indicators } = analyzeThreatLevel(responseText)

    return NextResponse.json({ threatLevel, score, analysis: responseText, indicators })
  } catch(error:any) {
    console.error("[v0] Scan-text error:", error)
    if(error.message?.includes("quota") || error.message?.includes("429")) {
      return NextResponse.json({
        threatLevel:"medium",
        score:50,
        analysis:"API quota exceeded. Try again later.",
        indicators:[],
        error:"quotaExceeded"
      },{status:429})
    }
    return NextResponse.json({
      threatLevel:"medium",
      score:50,
      analysis:"Failed to analyze text. Please try again.",
      indicators:[],
      error:"internalError"
    },{status:500})
  }
}
