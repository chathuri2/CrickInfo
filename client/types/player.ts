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

export type MatchFormat = "T20" | "ODI" | "Test"
export type PitchType = "Batting" | "Bowling" | "Balanced" | "Spin-friendly" | "Pace-friendly"
export type Weather = "Sunny" | "Overcast" | "Rainy" | "Humid"

export interface MatchConditions {
  format: MatchFormat
  pitchType: PitchType
  weather: Weather
  venue: string
}

export interface PlayerStats {
  format: MatchFormat
  battingAverage?: number
  bowlingAverage?: number
  strikeRate?: number
  economyRate?: number
  recentForm: number // Last 5 matches average
}

export interface PlayerComparison {
  player1: Player
  player2: Player
  comparisonMetrics: string[]
}

export interface SmartSuggestion {
  recommendedPlayers: Player[]
  reasoning: string[]
  confidence: number
}

export interface Squad {
  players: Player[]
  captain?: Player
  wicketKeeper?: Player
}
