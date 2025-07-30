import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, BarChart3, Target, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-5xl font-bold text-gray-900">Sri Lankan Cricket Squad Selector</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Build your perfect Sri Lankan cricket team from a comprehensive database of current and former national
          players. Analyze statistics, create balanced squads, and export your selections.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild size="lg">
            <Link href="/squad-selector">
              <Users className="w-5 h-5 mr-2" />
              Start Selecting
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/statistics">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Statistics
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Comprehensive Player Database</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Access detailed information about 28+ Sri Lankan cricketers including batting averages, bowling
              statistics, and match records.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-6 h-6 text-green-600" />
              <span>Smart Squad Validation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Intelligent validation ensures your squad has the right balance of batsmen, bowlers, all-rounders, and
              wicket-keepers.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <span>Role-Based Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Filter and search players by their specific roles: batsmen, bowlers, all-rounders, and wicket-keepers.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-red-600" />
              <span>Detailed Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Compare player performance with comprehensive statistics including averages, matches played, and career
              highlights.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-600" />
              <span>Export & Share</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Export your selected squad as JSON for analysis or sharing with other cricket enthusiasts.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-orange-600" />
              <span>Team Composition</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Visual representation of your squad composition with role distribution and team balance analysis.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Statistics</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold text-blue-600">28+</div>
            <div className="text-gray-600">Sri Lankan Players</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600">4</div>
            <div className="text-gray-600">Player Roles</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600">11</div>
            <div className="text-gray-600">Players per Squad</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-red-600">100%</div>
            <div className="text-gray-600">Sri Lankan Focus</div>
          </div>
        </div>
      </div>
    </div>
  )
}
