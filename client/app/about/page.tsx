import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Target, Users, BarChart3 } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">About Sri Lankan Cricket Squad Selector</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive platform for cricket enthusiasts to build and analyze Sri Lankan cricket teams
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-blue-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To provide cricket fans, analysts, and enthusiasts with a powerful tool to explore, analyze, and create
              Sri Lankan cricket squads based on comprehensive player statistics and performance data.
            </p>
            <p>
              We believe in the power of data-driven decision making in cricket team selection, while also honoring the
              rich tradition and talent of Sri Lankan cricket.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Comprehensive player database with 28+ Sri Lankan cricketers
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Detailed statistics including batting and bowling averages
              </li>
              <li className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Smart squad validation for balanced team composition
              </li>
              <li className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Export functionality for sharing and analysis
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold">Browse Players</h3>
              <p className="text-sm text-muted-foreground">
                Explore our comprehensive database of Sri Lankan cricketers with detailed statistics
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold">Select Squad</h3>
              <p className="text-sm text-muted-foreground">
                Choose 11 players using our intelligent filtering and validation system
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold">Analyze & Export</h3>
              <p className="text-sm text-muted-foreground">
                Review team composition and export your squad for further analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Player Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <h3 className="font-semibold text-blue-800">Batsmen</h3>
              <p className="text-sm text-blue-600 mt-1">Specialist batting players</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <h3 className="font-semibold text-red-800">Bowlers</h3>
              <p className="text-sm text-red-600 mt-1">Specialist bowling players</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <h3 className="font-semibold text-green-800">All-rounders</h3>
              <p className="text-sm text-green-600 mt-1">Players skilled in both batting and bowling</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <h3 className="font-semibold text-purple-800">Wicket-keepers</h3>
              <p className="text-sm text-purple-600 mt-1">Specialist wicket-keeping players</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources & Accuracy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Our player database includes statistics from international cricket matches, including Test matches, ODIs,
            and T20 internationals. All statistics are sourced from official cricket records and are regularly updated.
          </p>
          <p>
            The application focuses exclusively on Sri Lankan cricketers who have represented or are eligible to
            represent the national team, providing a comprehensive view of the country's cricket talent pool.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
