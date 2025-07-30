export interface Player {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  battingAverage?: number
  bowlingAverage?: number
  matchesPlayed: number
  country: string
  isSelected: boolean
}

export interface Squad {
  players: Player[]
  captain?: Player
  wicketKeeper?: Player
}
