"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Player } from "../types/player"

interface PlayerComparisonProps {
  players: Player[]
}

export function PlayerComparison({ players }: PlayerComparisonProps) {
  const [player1, setPlayer1] = useState<Player | null>(null)
  const [player2, setPlayer2] = useState<Player | null>(null)

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

  const compareStats = (stat1?: number, stat2?: number, lowerIsBetter = false) => {
    if (!stat1 || !stat2) return <Minus className="w-4 h-4 text-gray-400" />

    const isPlayer1Better = lowerIsBetter ? stat1 < stat2 : stat1 > stat2

    if (isPlayer1Better) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (stat1 === stat2) {
      return <Minus className="w-4 h-4 text-gray-400" />
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
  }

  const resetComparison = () => {
    setPlayer1(null)
    setPlayer2(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="w-5 h-5" />
          Player Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Player Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Player 1</label>
            <Select
              value={player1?.id || ""}
              onValueChange={(value) => {
                const selected = players.find((p) => p.id === value)
                setPlayer1(selected || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select first player" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} ({player.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Player 2</label>
            <Select
              value={player2?.id || ""}
              onValueChange={(value) => {
                const selected = players.find((p) => p.id === value)
                setPlayer2(selected || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select second player" />
              </SelectTrigger>
              <SelectContent>
                {players
                  .filter((p) => p.id !== player1?.id)
                  .map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} ({player.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {player1 && player2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Comparison Results</h3>
              <Button variant="outline" size="sm" onClick={resetComparison}>
                Reset
              </Button>
            </div>

            {/* Player Headers */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold">{player1.name}</h4>
                <Badge className={getRoleColor(player1.role)} variant="secondary">
                  {player1.role}
                </Badge>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold">{player2.name}</h4>
                <Badge className={getRoleColor(player2.role)} variant="secondary">
                  {player2.role}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Statistics Comparison */}
            <div className="space-y-4">
              <h4 className="font-semibold">Statistical Comparison</h4>

              {/* Matches Played */}
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{player1.matchesPlayed}</div>
                  <div className="text-sm text-muted-foreground">Matches</div>
                </div>
                <div className="text-center">{compareStats(player1.matchesPlayed, player2.matchesPlayed)}</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{player2.matchesPlayed}</div>
                  <div className="text-sm text-muted-foreground">Matches</div>
                </div>
              </div>

              {/* Batting Average */}
              {(player1.battingAverage || player2.battingAverage) && (
                <div className="grid md:grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{player1.battingAverage || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Batting Avg</div>
                  </div>
                  <div className="text-center">{compareStats(player1.battingAverage, player2.battingAverage)}</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{player2.battingAverage || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Batting Avg</div>
                  </div>
                </div>
              )}

              {/* Bowling Average */}
              {(player1.bowlingAverage || player2.bowlingAverage) && (
                <div className="grid md:grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{player1.bowlingAverage || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Bowling Avg</div>
                  </div>
                  <div className="text-center">
                    {compareStats(player1.bowlingAverage, player2.bowlingAverage, true)}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{player2.bowlingAverage || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">Bowling Avg</div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Role Comparison */}
            <div className="space-y-2">
              <h4 className="font-semibold">Role Analysis</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{player1.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {player1.role === player2.role
                      ? `Both players are ${player1.role}s - direct comparison possible`
                      : `${player1.role} - Different role from ${player2.name}`}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{player2.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {player1.role === player2.role
                      ? `Both players are ${player2.role}s - direct comparison possible`
                      : `${player2.role} - Different role from ${player1.name}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Recommendation</h4>
              <p className="text-sm text-blue-700">
                {player1.role === player2.role
                  ? "Since both players have the same role, consider recent form, match conditions, and team balance when making your selection."
                  : "These players serve different roles in the team. Consider selecting both if team composition allows."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
