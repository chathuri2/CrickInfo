"use client"

import { useState, useMemo } from "react"
import { playersDatabase } from "../data/players"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Award, Users } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type Format = "t20" | "odi" | "test"

export function PlayerStatistics() {
  const [format, setFormat] = useState<Format>("t20")
  const [sortBy, setSortBy] = useState<string>("battingAverage")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [showRecentForm, setShowRecentForm] = useState(false)
  const [opponentFilter, setOpponentFilter] = useState<string>("all")

  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = playersDatabase

    if (roleFilter !== "all") {
      filtered = filtered.filter((player) => player.role === roleFilter)
    }

    return filtered.sort((a, b) => {
      const statsA = a.stats?.[format] || { battingAverage: 0, bowlingAverage: 100, matchesPlayed: 0 }
      const statsB = b.stats?.[format] || { battingAverage: 0, bowlingAverage: 100, matchesPlayed: 0 }

      switch (sortBy) {
        case "battingAverage":
          return (statsB.battingAverage || 0) - (statsA.battingAverage || 0)
        case "bowlingAverage":
          return (statsA.bowlingAverage || 100) - (statsB.bowlingAverage || 100) // Lower is better
        case "matchesPlayed":
          return (statsB.matchesPlayed || 0) - (statsA.matchesPlayed || 0)
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [sortBy, roleFilter, format])

  const getTopPerformers = () => {
    const topBatsman =
      playersDatabase
        .filter((p) => p.stats?.[format]?.battingAverage !== undefined)
        .sort(
          (a, b) =>
            (b.stats?.[format]?.battingAverage || 0) - (a.stats?.[format]?.battingAverage || 0)
        )[0] || null

    const topBowler =
      playersDatabase
        .filter((p) => p.stats?.[format]?.bowlingAverage !== undefined)
        .sort(
          (a, b) =>
            (a.stats?.[format]?.bowlingAverage || 100) - (b.stats?.[format]?.bowlingAverage || 100)
        )[0] || null

    const mostExperienced =
      playersDatabase
        .sort(
          (a, b) => (b.stats?.[format]?.matchesPlayed || 0) - (a.stats?.[format]?.matchesPlayed || 0)
        )[0] || null

    return { topBatsman, topBowler, mostExperienced }
  }

  const { topBatsman, topBowler, mostExperienced } = getTopPerformers()

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

  const roleStats = useMemo(() => {
    return playersDatabase.reduce(
      (acc, player) => {
        acc[player.role] = (acc[player.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
  }, [])

  const opponents = [
    "India",
    "Australia",
    "England",
    "Pakistan",
    "South Africa",
    "New Zealand",
    "Bangladesh",
    "West Indies",
    "Afghanistan",
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Format Selection */}
      <div className="flex justify-center gap-4 mb-4">
        <Select value={format} onValueChange={(val) => setFormat(val as Format)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="t20">T20</SelectItem>
            <SelectItem value="odi">ODI</SelectItem>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top Performers */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top Batsman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{topBatsman?.name || "N/A"}</h3>
              <p className="text-2xl font-bold text-blue-600">{topBatsman?.stats?.[format]?.battingAverage ?? "N/A"}</p>
              <p className="text-sm text-muted-foreground">Batting Average</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-600" />
              Top Bowler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{topBowler?.name || "N/A"}</h3>
              <p className="text-2xl font-bold text-red-600">{topBowler?.stats?.[format]?.bowlingAverage ?? "N/A"}</p>
              <p className="text-sm text-muted-foreground">Bowling Average</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Most Experienced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{mostExperienced?.name || "N/A"}</h3>
              <p className="text-2xl font-bold text-green-600">{mostExperienced?.stats?.[format]?.matchesPlayed ?? "N/A"}</p>
              <p className="text-sm text-muted-foreground">Matches Played</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player List */}
      <Card>
        <CardHeader>
          <CardTitle>All Players</CardTitle>
          <div className="flex gap-4 mt-2 flex-wrap">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Batsman">Batsman</SelectItem>
                <SelectItem value="Bowler">Bowler</SelectItem>
                <SelectItem value="All-rounder">All-rounder</SelectItem>
                <SelectItem value="Wicket-keeper">Wicket-keeper</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="battingAverage">Batting Average</SelectItem>
                <SelectItem value="bowlingAverage">Bowling Average</SelectItem>
                <SelectItem value="matchesPlayed">Matches Played</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAndSortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-gray-400 w-8">#{index + 1}</div>
                  <div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <Badge className={getRoleColor(player.role)} variant="secondary">
                      {player.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  {player.stats?.[format]?.battingAverage !== undefined && (
                    <div className="text-center">
                      <div className="font-bold">{player.stats[format].battingAverage}</div>
                      <div className="text-muted-foreground">Bat Avg</div>
                    </div>
                  )}
                  {player.stats?.[format]?.bowlingAverage !== undefined && (
                    <div className="text-center">
                      <div className="font-bold">{player.stats[format].bowlingAverage}</div>
                      <div className="text-muted-foreground">Bowl Avg</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-bold">{player.stats?.[format]?.matchesPlayed ?? 0}</div>
                    <div className="text-muted-foreground">Matches</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
