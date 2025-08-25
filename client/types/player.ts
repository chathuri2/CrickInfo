export type Player = {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  country: string
  isSelected: boolean
  stats: {
    t20?: PlayerStats
    odi?: PlayerStats
    test?: PlayerStats
  }
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

export type PlayerStats = {
  battingAverage: number
  strikeRate: number
  matchesPlayed: number
  bowlingAverage?: number
  bowlingEconomy?: number
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
