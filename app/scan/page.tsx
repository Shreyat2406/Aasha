"use client"

import type React from "react"

import { useState,useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, CheckCircle2, XCircle, Loader2, Upload, LinkIcon, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const { user, updateUserPoints, updateUserStats } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("url")
  const [url, setUrl] = useState("")
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)

 useEffect(() => {
  if (!user) router.push("/auth");
}, [user, router]);

if (!user) return null;


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const scanUrl = async () => {
    setScanning(true)
    setResult(null)

    try {
      console.log("[v0] Starting URL scan...")
      const response = await fetch("/api/scan-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      console.log("[v0] Response status:", response.status)
      const data = await response.json()
      console.log("[v0] Response data:", data)
      setResult(data)

      if (!data.error) {
        await updateUserPoints(10)
        await updateUserStats({ scansCompleted: (user.stats?.scansCompleted || 0) + 1 })
      }
    } catch (error) {
      console.error("[v0] Scan URL error:", error)
      setResult({ error: "Failed to scan URL" })
    } finally {
      setScanning(false)
    }
  }

  const scanText = async () => {
    setScanning(true)
    setResult(null)

    try {
      console.log("[v0] Starting text scan...")
      const response = await fetch("/api/scan-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      console.log("[v0] Response status:", response.status)
      const data = await response.json()
      console.log("[v0] Response data:", data)
      setResult(data)

      if (!data.error) {
        await updateUserPoints(10)
        await updateUserStats({ scansCompleted: (user.stats?.scansCompleted || 0) + 1 })
      }
    } catch (error) {
      console.error("[v0] Scan text error:", error)
      setResult({ error: "Failed to scan text" })
    } finally {
      setScanning(false)
    }
  }

  const scanImage = async () => {
    if (!image) return

    setScanning(true)
    setResult(null)

    try {
      console.log("[v0] Starting image scan...")
      const formData = new FormData()
      formData.append("image", image)

      const response = await fetch("/api/scan-image", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)
      const data = await response.json()
      console.log("[v0] Response data:", data)
      setResult(data)

      if (!data.error) {
        await updateUserPoints(15)
        await updateUserStats({ scansCompleted: (user.stats?.scansCompleted || 0) + 1 })
      }
    } catch (error) {
      console.error("[v0] Scan image error:", error)
      setResult({ error: "Failed to scan image" })
    } finally {
      setScanning(false)
    }
  }

  const getThreatColor = (level: string) => {
    if (!level) return "text-muted-foreground"
    const safeLevel = String(level || "")
      .toLowerCase()
      .trim()
    if (!safeLevel) return "text-muted-foreground"

    switch (safeLevel) {
      case "safe":
        return "text-success"
      case "low":
        return "text-chart-3"
      case "medium":
        return "text-warning"
      case "high":
      case "critical":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getThreatIcon = (level: string) => {
    if (!level) return <Shield className="h-12 w-12 text-muted-foreground" />
    const safeLevel = String(level || "")
      .toLowerCase()
      .trim()
    if (!safeLevel) return <Shield className="h-12 w-12 text-muted-foreground" />

    switch (safeLevel) {
      case "safe":
        return <CheckCircle2 className="h-12 w-12 text-success" />
      case "low":
      case "medium":
        return <AlertTriangle className="h-12 w-12 text-warning" />
      case "high":
      case "critical":
        return <XCircle className="h-12 w-12 text-destructive" />
      default:
        return <Shield className="h-12 w-12 text-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Scam Detector</h1>
          <p className="text-muted-foreground">Scan URLs, messages, or images to detect potential threats and scams</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Choose Scan Type</CardTitle>
            <CardDescription>Select what you want to scan for potential threats</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="url" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Enter URL or Link</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button onClick={scanUrl} disabled={!url || scanning} className="w-full">
                  {scanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Scan URL
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="text">Enter Message or Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Paste suspicious message here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button onClick={scanText} disabled={!text || scanning} className="w-full">
                  {scanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Analyze Text
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImage(null)
                            setImagePreview(null)
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={scanImage} disabled={!image || scanning} className="w-full">
                  {scanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Scan Image
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {result && !result.error && result.threatLevel && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">{getThreatIcon(result.threatLevel)}</div>
              <CardTitle className={`text-2xl text-center ${getThreatColor(result.threatLevel)}`}>
                {String(result.threatLevel || "UNKNOWN").toUpperCase()} RISK
              </CardTitle>
              <CardDescription className="text-center">Threat Score: {result.score || 0}/100</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={result.score || 0} className="h-2" />

              <Alert>
                <AlertDescription className="text-sm leading-relaxed">{result.analysis}</AlertDescription>
              </Alert>

              {Array.isArray(result.indicators) &&
                result.indicators.filter(
                  (indicator: any) =>
                    indicator &&
                    typeof indicator.type === "string" &&
                    typeof indicator.description === "string" &&
                    typeof indicator.severity === "string",
                ).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Threat Indicators:</h3>
                    <div className="space-y-2">
                      {result.indicators
                        .filter(
                          (indicator: any) =>
                            indicator &&
                            typeof indicator.type === "string" &&
                            typeof indicator.description === "string" &&
                            typeof indicator.severity === "string",
                        )
                        .map((indicator: any, index: number) => (
                          <Alert key={index} variant={indicator.severity === "high" ? "destructive" : "default"}>
                            <AlertDescription>
                              <span className="font-medium">{indicator.type}:</span> {indicator.description}
                            </AlertDescription>
                          </Alert>
                        ))}
                    </div>
                  </div>
                )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  You earned{" "}
                  <span className="font-semibold text-foreground">+{activeTab === "image" ? "15" : "10"} points</span>{" "}
                  for scanning!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {result?.error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
