// API utilities for Gemini and Vision API calls

export async function analyzeWithGemini(prompt: string): Promise<string> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    throw new Error("Failed to analyze with Gemini")
  }

  const data = await response.json()
  return data.result
}

export async function analyzeImageWithVision(imageUrl: string): Promise<string> {
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  })

  if (!response.ok) {
    throw new Error("Failed to analyze image")
  }

  const data = await response.json()
  return data.result
}

export async function chatWithAI(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    throw new Error("Failed to chat with AI")
  }

  const data = await response.json()
  return data.message
}
