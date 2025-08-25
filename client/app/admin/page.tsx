"use client"

import { useState, useEffect } from "react"
import type { Player } from "@/types/player"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, Edit, Trash2, BarChart3, Shield, Database, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CSVUpload } from "@/components/csv-upload"

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "Batsman" as Player["role"],
  })

  // --- 1. FETCH PLAYERS FROM JSON-SERVER ---
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("http://localhost:3001/players")
        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        console.error("Failed to fetch players:", error)
        toast({ title: "Error", description: "Could not connect to the player database.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlayers()
  }, [])


  const handleAddPlayer = async () => {
    if (!newPlayer.name) {
      alert("Player name is required.")
      return
    }

    const playerToAdd: Player = {
      id: Date.now().toString(),
      name: newPlayer.name,
      role: newPlayer.role,
      country: "Sri Lanka",
      isSelected: false,
      // Create player with the CORRECT nested stats object
      stats: {
        t20: { battingAverage: 0, strikeRate: 0, matchesPlayed: 0 },
        odi: { battingAverage: 0, strikeRate: 0, matchesPlayed: 0 },
        test: { battingAverage: 0, strikeRate: 0, matchesPlayed: 0 },
      },
    }

    try {
      const response = await fetch("http://localhost:3001/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerToAdd),
      })
      if (response.ok) {
        const addedPlayer = await response.json()
        setPlayers(prev => [...prev, addedPlayer])
        setNewPlayer({ name: "", role: "Batsman" })
        toast({ title: "Player Added", description: `${addedPlayer.name} has been added.` })
      }
    } catch (error) {
      console.error("Failed to add player:", error)
    }
  }

  // --- 3. CORRECTED DELETE PLAYER FUNCTION ---
  const handleDeletePlayer = async (playerId: string) => {
    const player = players.find((p) => p.id === playerId)
    if (!window.confirm(`Are you sure you want to delete ${player?.name}?`)) return

    try {
      const response = await fetch(`http://localhost:3001/players/${playerId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setPlayers(players.filter((p) => p.id !== playerId))
        toast({ title: "Player Removed", description: `${player?.name} has been removed.`, variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to delete player:", error)
    }
  }

  const handlePlayersUploaded = (uploadedPlayers: any[]) => {
    // This function would also need to POST each player to the json-server
    // For now, it just updates the local UI state
    setPlayers(prev => [...prev, ...uploadedPlayers]);
    toast({ title: "Players Imported", description: `${uploadedPlayers.length} players imported locally.` })
  }

  const getRoleColor = (role: string) => {
    // (This function is fine, no changes needed)
    switch (role) {
      case "Batsman": return "bg-blue-100 text-blue-800"
      case "Bowler": return "bg-red-100 text-red-800"
      case "All-rounder": return "bg-green-100 text-green-800"
      case "Wicket-keeper": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }
  
  // --- UI & JSX (Mostly the same, just removed stat inputs from the simple form) ---
  if (isLoading) return <div className="p-10 text-center">Loading Admin Dashboard...</div>

  const stats = {
    totalPlayers: players.length,
    totalUsers: 1247,
    activeSquads: 89,
    systemHealth: "Excellent",
  }

  const roleStats = players.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header and Stats Overview (No changes needed here) */}
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

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Players</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalPlayers}</div><p className="text-xs text-muted-foreground">Sri Lankan cricketers</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Registered Users</CardTitle><UserPlus className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div><p className="text-xs text-muted-foreground">+12% from last month</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Squads</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.activeSquads}</div><p className="text-xs text-muted-foreground">Created this week</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">System Health</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.systemHealth}</div><p className="text-xs text-muted-foreground">All systems operational</p></CardContent>
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
                <CardHeader><CardTitle className="flex items-center gap-2"><Database className="w-5 h-5" />Player Database ({players.length} players)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{player.name}</h3>
                            <Badge className={getRoleColor(player.role)} variant="secondary">{player.role}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeletePlayer(player.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader><CardTitle>Add New Player</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerName">Player Name</Label>
                    <Input id="playerName" value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })} placeholder="Enter player name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="playerRole">Role</Label>
                    <Select value={newPlayer.role} onValueChange={(value: any) => setNewPlayer({ ...newPlayer, role: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Batsman">Batsman</SelectItem>
                        <SelectItem value="Bowler">Bowler</SelectItem>
                        <SelectItem value="All-rounder">All-rounder</SelectItem>
                        <SelectItem value="Wicket-keeper">Wicket-keeper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddPlayer} className="w-full" disabled={!newPlayer.name}><UserPlus className="w-4 h-4 mr-2" />Add Player</Button>
                </CardContent>
              </Card>
              {/* Other cards like Role Distribution can stay here */}
            </div>
          </div>
          <div className="mt-6"><CSVUpload onPlayersUploaded={handlePlayersUploaded} /></div>
        </TabsContent>

        {/* Other TabsContent sections (no changes needed) */}
        <TabsContent value="users"><Card><CardHeader><CardTitle>User Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">User management features will be implemented here.</p></CardContent></Card></TabsContent>
        <TabsContent value="analytics"><Card><CardHeader><CardTitle>Analytics Dashboard</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Analytics and reporting features will be implemented here.</p></CardContent></Card></TabsContent>
        <TabsContent value="settings"><Card><CardHeader><CardTitle>System Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">System configuration options will be implemented here.</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  )
}