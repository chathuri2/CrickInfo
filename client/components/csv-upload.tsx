"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Player } from "../types/player"

interface CSVUploadProps {
  onPlayersUploaded: (players: Player[]) => void
}

export function CSVUpload({ onPlayersUploaded }: CSVUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setError("Please select a valid CSV file")
        return
      }
      setUploadedFile(file)
      setError("")
    }
  }

  const processCSV = async (csvText: string): Promise<Player[]> => {
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

    const players: Player[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())

      if (values.length < headers.length) continue

      const player: Player = {
        id: Date.now().toString() + i,
        name: values[headers.indexOf("name")] || "",
        role: (values[headers.indexOf("role")] as any) || "Batsman",
        battingAverage: values[headers.indexOf("batting_average")]
          ? Number.parseFloat(values[headers.indexOf("batting_average")])
          : undefined,
        bowlingAverage: values[headers.indexOf("bowling_average")]
          ? Number.parseFloat(values[headers.indexOf("bowling_average")])
          : undefined,
        matchesPlayed: Number.parseInt(values[headers.indexOf("matches_played")] || "0"),
        country: values[headers.indexOf("country")] || "Sri Lanka",
        isSelected: false,
      }

      if (player.name) {
        players.push(player)
      }
    }

    return players
  }

  const handleUpload = async () => {
    if (!uploadedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError("")

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Read file content
      const fileContent = await uploadedFile.text()

      // Process CSV
      const newPlayers = await processCSV(fileContent)

      if (newPlayers.length === 0) {
        throw new Error("No valid player data found in CSV")
      }

      // Complete progress
      setUploadProgress(100)

      // Call callback with new players
      onPlayersUploaded(newPlayers)

      toast({
        title: "Upload Successful!",
        description: `${newPlayers.length} players have been added to the database.`,
      })

      // Reset form
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process CSV file")
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const downloadTemplate = () => {
    const csvContent = `name,role,batting_average,bowling_average,matches_played,country
Dimuth Karunaratne,Batsman,38.96,,93,Sri Lanka
Lasith Embuldeniya,Bowler,,28.36,17,Sri Lanka
Angelo Mathews,All-rounder,46.04,33.98,104,Sri Lanka
Dinesh Chandimal,Wicket-keeper,42.49,,73,Sri Lanka`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "player_template.csv"
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded to help you format your data.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Player Dataset
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Upload a CSV file containing player data to add new players to the database.
          </p>

          <Button variant="outline" onClick={downloadTemplate} className="w-full bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />

            {!uploadedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Select CSV File
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Choose a CSV file with player data</p>
              </div>
            ) : (
              <div className="space-y-2">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                <div className="font-medium">{uploadedFile.name}</div>
                <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            )}
          </div>

          {uploadedFile && !isUploading && (
            <Button onClick={handleUpload} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload and Process
            </Button>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Required CSV columns:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>name - Player's full name</li>
            <li>role - Batsman, Bowler, All-rounder, or Wicket-keeper</li>
            <li>batting_average - Batting average (optional)</li>
            <li>bowling_average - Bowling average (optional)</li>
            <li>matches_played - Number of matches played</li>
            <li>country - Player's country (defaults to Sri Lanka)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
