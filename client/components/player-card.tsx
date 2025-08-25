"use client"

import type { Player } from "../types/player"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"

// Define the possible match formats
type MatchFormat = "t20" | "odi" | "test"

interface PlayerCardProps {
  player: Player
  onToggleSelect: (playerId: string) => void
  isDisabled?: boolean
  matchFormat: MatchFormat // <-- Add this new prop
}

export function PlayerCard({
  player,
  onToggleSelect,
  isDisabled,
  matchFormat, // <-- Destructure the new prop
}: PlayerCardProps) {
  const getRoleColor = (role: Player["role"]) => {
    // ... (this function remains the same)
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

  // Get the stats for the selected format
  const stats = player.stats[matchFormat];

  return (
    <Card
      className={`transition-all duration-200 ${
        player.isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{player.name}</h3>
            <Badge className={getRoleColor(player.role)} variant="secondary">
              {player.role}
            </Badge>
            {/* --- MODIFIED STATS SECTION --- */}
            <div className="mt-2 space-y-1 text-sm">
              {stats?.battingAverage && (
                <p>
                  Batting Avg: <span className="font-medium">{stats.battingAverage}</span>
                </p>
              )}
              {stats?.bowlingAverage && (
                <p>
                  Bowling Avg: <span className="font-medium">{stats.bowlingAverage}</span>
                </p>
              )}
              {stats?.matchesPlayed !== undefined && ( // Check for undefined to show '0' if needed
                <p>
                  Matches: <span className="font-medium">{stats.matchesPlayed}</span>
                </p>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant={player.isSelected ? "destructive" : "default"}
            onClick={() => onToggleSelect(player.id)}
            disabled={isDisabled && !player.isSelected}
            className="ml-2"
          >
            {player.isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}