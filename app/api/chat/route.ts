import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

    const systemPrompt = `You are AASHA, an AI cyber safety assistant designed to help users, especially children and teens, stay safe online. Your role is to:

1. Educate users about cyber security threats (phishing, scams, malware, etc.)
2. Provide practical advice for staying safe online
3. Explain complex security concepts in simple, easy-to-understand language
4. Be friendly, approachable, and encouraging
5. Never share harmful information or help with malicious activities
6. Emphasize the importance of asking trusted adults for help when needed

Keep responses concise, informative, and age-appropriate.`

    // Combine system prompt with user messages
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'll help users stay safe online with clear, friendly advice." }],
        },
        ...messages.slice(0, -1).map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      ],
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ message: text })
  } catch (error: any) {
    console.error("[v0] Error in chat:", error)

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
        error: "Failed to process chat message. Please check your API key and try again.",
      },
      { status: 500 },
    )
  }
}
