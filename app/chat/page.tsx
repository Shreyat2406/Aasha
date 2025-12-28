import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Retry wrapper
async function generateWithRetry(model: any, prompt: string, retries = 3, delayMs = 2000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      if (err.message?.includes("quota") || err.message?.includes("429")) {
        if (attempt < retries - 1) {
          console.warn(`[Gemini] Rate limit hit. Retrying in ${delayMs}ms... (Attempt ${attempt + 1})`);
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
      }
      throw err;
    }
  }
  throw new Error("Failed to get response after retries");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ error: "No messages provided" });

    const prompt = messages.map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n") + "\nAssistant:";

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const text = await generateWithRetry(model, prompt);

    res.status(200).json({ message: text });
  } catch (error: any) {
    console.error("Chat API error:", error);

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return res.status(429).json({ error: "API quota exceeded. Try again later.", quotaExceeded: true });
    }

    return res.status(500).json({ error: "Failed to generate response. Please try again later." });
  }
}

