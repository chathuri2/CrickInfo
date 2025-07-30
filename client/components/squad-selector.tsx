"use client"

import { useState, useMemo } from "react"
import type { Player } from "../types/player"
import { playersDatabase } from "../data/players"
import { PlayerCard } from "./player-card"
import { SquadDisplay } from "./squad-display"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, RotateCcw, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SquadSelector() {
  const [players, setPlayers] = useState<Player[]>(playersDatabase)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const { toast } = useToast()

  const selectedPlayers = players.filter((p) => p.isSelected)
  const isSquadFull = selectedPlayers.length >= 11

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.role.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === "all" || player.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [players, searchTerm, roleFilter])

  const togglePlayerSelection = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id === playerId) {
          if (!player.isSelected && isSquadFull) {
            toast({
              title: "Squad Full",
              description: "You can only select 11 players for the squad.",
              variant: "destructive",
            })
            return player
          }
          return { ...player, isSelected: !player.isSelected }
        }
        return player
      }),
    )
  }

  const resetSquad = () => {
    setPlayers((prev) => prev.map((player) => ({ ...player, isSelected: false })))
    toast({
      title: "Squad Reset",
      description: "All players have been deselected.",
    })
  }

  const exportSquad = () => {
    const squadData = {
      players: selectedPlayers,
      composition: selectedPlayers.reduce(
        (acc, player) => {
          acc[player.role] = (acc[player.role] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      exportedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(squadData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "cricket-squad.json"
    link.click()

    toast({
      title: "Squad Exported",
      description: "Your squad has been exported successfully.",
    })
  }

  const getSquadValidation = () => {
    const roleCount = selectedPlayers.reduce(
      (acc, player) => {
        acc[player.role] = (acc[player.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const issues = []
    if (!roleCount["Wicket-keeper"]) issues.push("No wicket-keeper selected")
    if ((roleCount["Batsman"] || 0) < 3) issues.push("Need at least 3 batsmen")
    if ((roleCount["Bowler"] || 0) < 3) issues.push("Need at least 3 bowlers")

    return issues
  }

  const validationIssues = getSquadValidation()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Sri Lankan Cricket Squad Selector</h1>
        <p className="text-muted-foreground">Build your perfect Sri Lankan cricket team</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Player Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search Sri Lankan players by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />

              <div className="flex gap-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full">
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
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Showing {filteredPlayers.length} players</div>
                <Button variant="outline" size="sm" onClick={resetSquad}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Squad
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onToggleSelect={togglePlayerSelection}
                isDisabled={isSquadFull}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SquadDisplay selectedPlayers={selectedPlayers} />

          {validationIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Squad Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationIssues.map((issue, index) => (
                    <Badge key={index} variant="outline" className="text-orange-600 border-orange-600">
                      {issue}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedPlayers.length > 0 && (
            <Button onClick={exportSquad} className="w-full" disabled={selectedPlayers.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export Squad
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
