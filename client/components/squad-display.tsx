"use client"

import { useState } from "react"
import type { Player } from "../types/player"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Star, Shield } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SquadDisplayProps {
  selectedPlayers: Player[]
  captain?: Player
  wicketKeeper?: Player
}

export function SquadDisplay({ selectedPlayers, captain, wicketKeeper }: SquadDisplayProps) {
  const [format, setFormat] = useState<"t20" | "odi" | "test">("t20")

  const getRoleColor = (role: Player["role"]) => {
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

  const roleCount = selectedPlayers.reduce((acc, player) => {
    acc[player.role] = (acc[player.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Selected Squad ({selectedPlayers.length}/11)
        </CardTitle>

        <div className="mt-2 flex gap-4">
          <Select value={format} onValueChange={(val) => setFormat(val as "t20" | "odi" | "test")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="t20">T20</SelectItem>
              <SelectItem value="odi">ODI</SelectItem>
              <SelectItem value="test">Test</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {selectedPlayers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No players selected yet</p>
        ) : (
          <>
            <div className="grid gap-2 mb-4">
              {selectedPlayers.map((player) => {
                const stats = player.stats?.[format]

                return (
                  <div key={player.id} className="flex flex-col p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{player.name}</span>
                        {captain?.id === player.id && <Star className="w-4 h-4 text-yellow-500" role="Captain" />}
                        {wicketKeeper?.id === player.id && (
                          <Shield className="w-4 h-4 text-purple-500" role="Wicket Keeper" />
                        )}
                      </div>
                      <Badge className={getRoleColor(player.role)} variant="secondary">
                        {player.role}
                      </Badge>
                    </div>

                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold">{stats?.battingAverage ?? 0}</div>
                        <div className="text-muted-foreground">Bat Avg</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{stats?.bowlingAverage ?? 0}</div>
                        <div className="text-muted-foreground">Bowl Avg</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{stats?.matchesPlayed ?? 0}</div>
                        <div className="text-muted-foreground">Matches</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Squad Composition</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Batsmen: {roleCount["Batsman"] || 0}</div>
                <div>Bowlers: {roleCount["Bowler"] || 0}</div>
                <div>All-rounders: {roleCount["All-rounder"] || 0}</div>
                <div>Wicket-keepers: {roleCount["Wicket-keeper"] || 0}</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
