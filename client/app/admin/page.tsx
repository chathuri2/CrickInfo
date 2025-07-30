"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { playersDatabase } from "../../data/players"
import { Users, UserPlus, Edit, Trash2, BarChart3, Shield, Database, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminPage() {
  const [players, setPlayers] = useState(playersDatabase)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "Batsman" as const,
    battingAverage: "",
    bowlingAverage: "",
    matchesPlayed: "",
  })

  const handleAddPlayer = () => {
    const player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      role: newPlayer.role,
      battingAverage: newPlayer.battingAverage ? Number.parseFloat(newPlayer.battingAverage) : undefined,
      bowlingAverage: newPlayer.bowlingAverage ? Number.parseFloat(newPlayer.bowlingAverage) : undefined,
      matchesPlayed: Number.parseInt(newPlayer.matchesPlayed),
      country: "Sri Lanka",
      isSelected: false,
    }

    setPlayers([...players, player])
    setNewPlayer({
      name: "",
      role: "Batsman",
      battingAverage: "",
      bowlingAverage: "",
      matchesPlayed: "",
    })

    toast({
      title: "Player Added",
      description: `${player.name} has been added to the database.`,
    })
  }

  const handleDeletePlayer = (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    setPlayers(players.filter((p) => p.id !== playerId))

    toast({
      title: "Player Removed",
      description: `${player?.name} has been removed from the database.`,
      variant: "destructive",
    })
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

  const stats = {
    totalPlayers: players.length,
    totalUsers: 1247, // Mock data
    activeSquads: 89, // Mock data
    systemHealth: "Excellent",
  }

  const roleStats = players.reduce(
    (acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage players, users, and system settings</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Shield className="w-4 h-4 mr-1" />
          Admin Access
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">Sri Lankan cricketers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Squads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSquads}</div>
            <p className="text-xs text-muted-foreground">Created this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.systemHealth}</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="players" className="space-y-4">
        <TabsList>
          <TabsTrigger value="players">Player Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Player Database ({players.length} players)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{player.name}</h3>
                            <Badge className={getRoleColor(player.role)} variant="secondary">
                              {player.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeletePlayer(player.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Add New Player</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerName">Player Name</Label>
                    <Input
                      id="playerName"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      placeholder="Enter player name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerRole">Role</Label>
                    <Select
                      value={newPlayer.role}
                      onValueChange={(value: any) => setNewPlayer({ ...newPlayer, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Batsman">Batsman</SelectItem>
                        <SelectItem value="Bowler">Bowler</SelectItem>
                        <SelectItem value="All-rounder">All-rounder</SelectItem>
                        <SelectItem value="Wicket-keeper">Wicket-keeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="battingAvg">Batting Average</Label>
                    <Input
                      id="battingAvg"
                      type="number"
                      step="0.01"
                      value={newPlayer.battingAverage}
                      onChange={(e) => setNewPlayer({ ...newPlayer, battingAverage: e.target.value })}
                      placeholder="e.g., 45.50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bowlingAvg">Bowling Average</Label>
                    <Input
                      id="bowlingAvg"
                      type="number"
                      step="0.01"
                      value={newPlayer.bowlingAverage}
                      onChange={(e) => setNewPlayer({ ...newPlayer, bowlingAverage: e.target.value })}
                      placeholder="e.g., 28.75"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="matches">Matches Played</Label>
                    <Input
                      id="matches"
                      type="number"
                      value={newPlayer.matchesPlayed}
                      onChange={(e) => setNewPlayer({ ...newPlayer, matchesPlayed: e.target.value })}
                      placeholder="e.g., 50"
                    />
                  </div>

                  <Button onClick={handleAddPlayer} className="w-full" disabled={!newPlayer.name}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Player
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(roleStats).map(([role, count]) => (
                      <div key={role} className="flex justify-between items-center">
                        <Badge className={getRoleColor(role)} variant="secondary">
                          {role}
                        </Badge>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics and reporting features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System configuration options will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
