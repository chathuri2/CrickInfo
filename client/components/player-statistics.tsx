"use client"

import { useState, useMemo } from "react"
import { playersDatabase } from "../data/players"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Award, Users } from "lucide-react"

export function PlayerStatistics() {
  const [sortBy, setSortBy] = useState<string>("battingAverage")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = playersDatabase

    if (roleFilter !== "all") {
      filtered = filtered.filter((player) => player.role === roleFilter)
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "battingAverage":
          return (b.battingAverage || 0) - (a.battingAverage || 0)
        case "bowlingAverage":
          return (a.bowlingAverage || 100) - (b.bowlingAverage || 100) // Lower is better for bowling
        case "matchesPlayed":
          return b.matchesPlayed - a.matchesPlayed
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
  }, [sortBy, roleFilter])

  const getTopPerformers = () => {
    const topBatsman = playersDatabase
      .filter((p) => p.battingAverage)
      .sort((a, b) => (b.battingAverage || 0) - (a.battingAverage || 0))[0]

    const topBowler = playersDatabase
      .filter((p) => p.bowlingAverage)
      .sort((a, b) => (a.bowlingAverage || 100) - (b.bowlingAverage || 100))[0]

    const mostExperienced = playersDatabase.sort((a, b) => b.matchesPlayed - a.matchesPlayed)[0]

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
      {} as Record<string, number>,
    )
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Player Statistics</h1>
        <p className="text-muted-foreground">Comprehensive analysis of Sri Lankan cricket players</p>
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
              <h3 className="font-semibold text-lg">{topBatsman.name}</h3>
              <p className="text-2xl font-bold text-blue-600">{topBatsman.battingAverage}</p>
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
              <h3 className="font-semibold text-lg">{topBowler.name}</h3>
              <p className="text-2xl font-bold text-red-600">{topBowler.bowlingAverage}</p>
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
              <h3 className="font-semibold text-lg">{mostExperienced.name}</h3>
              <p className="text-2xl font-bold text-green-600">{mostExperienced.matchesPlayed}</p>
              <p className="text-sm text-muted-foreground">Matches Played</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Player Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(roleStats).map(([role, count]) => (
              <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <Badge className={getRoleColor(role)} variant="secondary">
                  {role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player List with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Players</CardTitle>
          <div className="flex gap-4">
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
                  {player.battingAverage && (
                    <div className="text-center">
                      <div className="font-bold">{player.battingAverage}</div>
                      <div className="text-muted-foreground">Bat Avg</div>
                    </div>
                  )}
                  {player.bowlingAverage && (
                    <div className="text-center">
                      <div className="font-bold">{player.bowlingAverage}</div>
                      <div className="text-muted-foreground">Bowl Avg</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-bold">{player.matchesPlayed}</div>
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
