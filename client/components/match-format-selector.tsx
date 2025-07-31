"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, Trophy } from "lucide-react"
import type { MatchFormat, PitchType, Weather, MatchConditions } from "../types/player"

interface MatchFormatSelectorProps {
  conditions: MatchConditions
  onConditionsChange: (conditions: MatchConditions) => void
}

export function MatchFormatSelector({ conditions, onConditionsChange }: MatchFormatSelectorProps) {
  const formatIcons = {
    T20: <Clock className="w-4 h-4" />,
    ODI: <Target className="w-4 h-4" />,
    Test: <Trophy className="w-4 h-4" />,
  }

  const formatColors = {
    T20: "bg-red-100 text-red-800",
    ODI: "bg-blue-100 text-blue-800",
    Test: "bg-green-100 text-green-800",
  }

  const venues = [
    "R. Premadasa Stadium, Colombo",
    "Galle International Stadium",
    "Pallekele International Cricket Stadium",
    "Mahinda Rajapaksa International Stadium",
    "Sinhalese Sports Club Ground",
    "P. Sara Oval, Colombo",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formatIcons[conditions.format]}
          Match Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Match Format</label>
            <Select
              value={conditions.format}
              onValueChange={(value: MatchFormat) => onConditionsChange({ ...conditions, format: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="T20">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    T20 International
                  </div>
                </SelectItem>
                <SelectItem value="ODI">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    One Day International
                  </div>
                </SelectItem>
                <SelectItem value="Test">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Test Match
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pitch Type</label>
            <Select
              value={conditions.pitchType}
              onValueChange={(value: PitchType) => onConditionsChange({ ...conditions, pitchType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Batting">Batting Friendly</SelectItem>
                <SelectItem value="Bowling">Bowling Friendly</SelectItem>
                <SelectItem value="Balanced">Balanced</SelectItem>
                <SelectItem value="Spin-friendly">Spin Friendly</SelectItem>
                <SelectItem value="Pace-friendly">Pace Friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Weather</label>
            <Select
              value={conditions.weather}
              onValueChange={(value: Weather) => onConditionsChange({ ...conditions, weather: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sunny">Sunny</SelectItem>
                <SelectItem value="Overcast">Overcast</SelectItem>
                <SelectItem value="Rainy">Rainy</SelectItem>
                <SelectItem value="Humid">Humid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Venue</label>
            <Select
              value={conditions.venue}
              onValueChange={(value) => onConditionsChange({ ...conditions, venue: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SelectItem key={venue} value={venue}>
                    {venue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Selected Format:</span>
          <Badge className={formatColors[conditions.format]} variant="secondary">
            {conditions.format}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
