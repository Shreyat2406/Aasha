import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

async function generateWithRetry(model: any, prompt: any, retries=3, delayMs=2000){
  for(let attempt=0; attempt<retries; attempt++){
    try{
      const result = await model.generateContent(prompt)
      return result.response.text()
    }catch(err:any){
      if((err.message?.includes("quota") || err.message?.includes("429")) && attempt<retries-1){
        console.warn(`[Gemini] Rate limit hit. Retrying in ${delayMs}ms (Attempt ${attempt+1})`)
        await new Promise(r=>setTimeout(r,delayMs))
        continue
      }
      throw err
    }
  }
  throw new Error("Failed after retries")
}

export async function POST(request: NextRequest){
  try{
    const formData = await request.formData()
    const image = formData.get("image") as File
    if(!image) return NextResponse.json({ error:"Image is required"},{status:400})

    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")

    const model = genAI.getGenerativeModel({ model:"gemini-flash-latest" })
    const prompt = `Analyze this image for scams, phishing, fake logins, QR codes, or suspicious content. Provide detailed assessment and threat level ("safe","low","medium","high","critical").`

    const responseText = await generateWithRetry(model, [
      prompt,
      { inlineData:{ data: base64Image, mimeType:image.type } }
    ])

    const lowerText = responseText.toLowerCase()
    let detectedLevel:"safe"|"low"|"medium"|"high"|"critical"="medium"
    if(lowerText.includes("critical") || lowerText.includes("severe threat")) detectedLevel="critical"
    else if(lowerText.includes("high") || lowerText.includes("significant threat")) detectedLevel="high"
    else if(lowerText.includes("medium") || lowerText.includes("moderate")) detectedLevel="medium"
    else if(lowerText.includes("low") || lowerText.includes("minor")) detectedLevel="low"
    else if(lowerText.includes("safe") || lowerText.includes("no threat")) detectedLevel="safe"

    const scoreMap:{[key:string]:number}={safe:10,low:30,medium:60,high:85,critical:95}

    return NextResponse.json({
      threatLevel:detectedLevel,
      score:scoreMap[detectedLevel]||50,
      analysis:responseText,
      indicators:[]
    })
  }catch(error:any){
    console.error("[v0] Scan-image error:", error)
    if(error.message?.includes("quota") || error.message?.includes("429")){
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
      analysis:"Failed to analyze image. Please try again.",
      indicators:[],
      error:"internalError"
    },{status:500})
  }
}
