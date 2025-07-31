import { PlayerStatistics } from "../../components/player-statistics"
import { PlayerComparison } from "../../components/player-comparison"
import { playersDatabase } from "../../data/players"

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <PlayerComparison players={playersDatabase} />
      <PlayerStatistics />
    </div>
  )
}
