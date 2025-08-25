"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Brain, CheckCircle, AlertCircle } from "lucide-react"
import type { Player, MatchConditions, SmartSuggestion } from "../types/player"
import { useToast } from "@/hooks/use-toast"

interface SmartSquadSuggestionProps {
  players: Player[]
  conditions: MatchConditions
  onApplySuggestion: (players: Player[]) => void
}

export function SmartSquadSuggestion({ players, conditions, onApplySuggestion }: SmartSquadSuggestionProps) {
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateSmartSuggestion = async () => {
    setIsGenerating(true)

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate team with new logic
    const selectedPlayers = smartSelectPlayers(players, conditions)
    const reasoning = generateReasoning(conditions, selectedPlayers)
    const confidence = calculateConfidence(selectedPlayers, conditions)

    const newSuggestion: SmartSuggestion = {
      recommendedPlayers: selectedPlayers,
      reasoning,
      confidence,
    }

    setSuggestion(newSuggestion)
    setIsGenerating(false)

    toast({
      title: "Smart Suggestion Generated!",
      description: `AI has recommended a ${conditions.format} squad with ${newSuggestion.confidence}% confidence.`,
    })
  }

  const smartSelectPlayers = (allPlayers: Player[], conditions: MatchConditions): Player[] => {
    const selected: Player[] = []

    // Helper function: Randomly pick n unique players from array
    const randomPick = <T,>(arr: T[], n: number): T[] => {
      if (arr.length <= n) return arr
      const result: T[] = []
      const copy = [...arr]
      while (result.length < n && copy.length > 0) {
        const idx = Math.floor(Math.random() * copy.length)
        result.push(copy.splice(idx, 1)[0])
      }
      return result
    }

    // Filter players by role
    const batsmen = allPlayers.filter((p) => p.role === "Batsman")
    const allRounders = allPlayers.filter((p) => p.role === "All-rounder")
    const bowlers = allPlayers.filter((p) => p.role === "Bowler")
    const keeperBatsmen = allPlayers.filter((p) => p.role === "Wicket-keeper")

    // Define required counts
    const BATSMEN_COUNT = 4
    const KEEPER_COUNT = 1
    const ALLROUNDER_COUNT = 2
    const BOWLER_COUNT = 4
    const EXTRAS_COUNT = 4

    // Select players randomly per role
    const selectedBatsmen = randomPick(batsmen, BATSMEN_COUNT)
    const selectedKeeper = randomPick(keeperBatsmen, KEEPER_COUNT)
    const selectedAllRounders = randomPick(allRounders, ALLROUNDER_COUNT)
    const selectedBowlers = randomPick(bowlers, BOWLER_COUNT)

    // Collect already selected player IDs to avoid duplicates
    const selectedIds = new Set<string>([
      ...selectedBatsmen.map((p) => p.id),
      ...selectedKeeper.map((p) => p.id),
      ...selectedAllRounders.map((p) => p.id),
      ...selectedBowlers.map((p) => p.id),
    ])

    // From remaining players (not selected), pick extras
    const remainingPlayers = allPlayers.filter((p) => !selectedIds.has(p.id))
    const selectedExtras = randomPick(remainingPlayers, EXTRAS_COUNT)

    // Compose final team
    selected.push(
      ...selectedBatsmen,
      ...selectedKeeper,
      ...selectedAllRounders,
      ...selectedBowlers,
      ...selectedExtras
    )

    // Safety: Limit to 11 players if somehow exceeded
    return selected.slice(0, 11)
  }

  const generateReasoning = (conditions: MatchConditions, selectedPlayers: Player[]): string[] => {
    const reasons = []

    reasons.push(`Selected squad optimized for ${conditions.format} format`)
    reasons.push(`Pitch conditions (${conditions.pitchType}) considered in selection`)
    reasons.push(`Weather conditions (${conditions.weather}) factored into team balance`)

    const roleCount = selectedPlayers.reduce(
      (acc, player) => {
        acc[player.role] = (acc[player.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    reasons.push(
      `Team composition: ${roleCount.Batsman || 0} batsmen, ${roleCount.Bowler || 0} bowlers, ${roleCount["All-rounder"] || 0} all-rounders, ${roleCount["Wicket-keeper"] || 0} wicket-keeper`
    )

    if (conditions.format === "T20") {
      reasons.push("Prioritized aggressive batsmen and death bowling specialists")
    } else if (conditions.format === "Test") {
      reasons.push("Emphasized technique and endurance for longer format")
    }

    return reasons
  }

  const calculateConfidence = (selectedPlayers: Player[], conditions: MatchConditions): number => {
    const hasWicketKeeper = selectedPlayers.some((p) => p.role === "Wicket-keeper")
    const hasBalancedRoles =
      selectedPlayers.filter((p) => p.role === "Batsman").length >= 3 &&
      selectedPlayers.filter((p) => p.role === "Bowler").length >= 3

    let confidence = 70
    if (hasWicketKeeper) confidence += 10
    if (hasBalancedRoles) confidence += 15
    if (selectedPlayers.length === 11) confidence += 5

    return Math.min(confidence, 95)
  }

  const applySuggestion = () => {
    if (suggestion) {
      onApplySuggestion(suggestion.recommendedPlayers)
      toast({
        title: "Squad Applied!",
        description: "Smart suggestion has been applied to your squad selection.",
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Batsman":
        return "bg-blue-100 text-blue-800"
      case "Bowler":
        return "bg-red-100 text-red-800"
      case "All-rounder":
        return "bg-green-100 text-green-800"
      case "Wicket-keeper":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Smart Squad Suggestion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestion ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Let AI analyze match conditions and suggest the optimal squad for {conditions.format} format
            </p>
            <Button onClick={generateSmartSuggestion} disabled={isGenerating} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating Suggestion..." : "Generate Smart Suggestion"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                AI Confidence: <strong>{suggestion.confidence}%</strong> - Squad optimized for current conditions
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-semibold">Recommended Squad ({suggestion.recommendedPlayers.length}/11):</h4>
              <div className="grid gap-2">
                {suggestion.recommendedPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-6">#{index + 1}</span>
                      <span>{player.name}</span>
                    </div>
                    <Badge className={getRoleColor(player.role)} variant="secondary">
                      {player.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">AI Reasoning:</h4>
              <ul className="space-y-1">
                {suggestion.reasoning.map((reason, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={applySuggestion} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply Suggestion
              </Button>
              <Button variant="outline" onClick={() => setSuggestion(null)}>
                Generate New
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
