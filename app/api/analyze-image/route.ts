import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Analyze image request received")
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("[v0] Fetching image from URL")
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString("base64")

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

    console.log("[v0] Sending image analysis request")
    const result = await model.generateContent([
      "Analyze this image for potential security threats, scams, or suspicious content. Provide a detailed description and assessment.",
      {
        inlineData: {
          data: base64Image,
          mimeType: imageResponse.headers.get("content-type") || "image/jpeg",
        },
      },
    ])

    const response = result.response
    const text = await response.text()
    console.log("[v0] Analysis complete")

    const lowerText = text.toLowerCase()
    let threatLevel = "medium"
    let score = 50

    if (lowerText.includes("critical") || lowerText.includes("severe")) {
      threatLevel = "critical"
      score = 95
    } else if (lowerText.includes("high risk") || lowerText.includes("dangerous")) {
      threatLevel = "high"
      score = 80
    } else if (lowerText.includes("medium") || lowerText.includes("caution")) {
      threatLevel = "medium"
      score = 50
    } else if (lowerText.includes("low") || lowerText.includes("minor")) {
      threatLevel = "low"
      score = 25
    } else if (lowerText.includes("safe") || lowerText.includes("no threat")) {
      threatLevel = "safe"
      score = 10
    }

    return NextResponse.json({
      threatLevel,
      score,
      analysis: text,
      indicators: [],
    })
  } catch (error: any) {
    console.error("[v0] Error analyzing image:", error)
    return NextResponse.json({ error: "Failed to analyze image with Vision API" }, { status: 500 })
  }
}
