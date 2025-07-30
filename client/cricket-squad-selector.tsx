import { SquadSelector } from "./components/squad-selector"
import { Toaster } from "@/components/ui/toaster"

export default function CricketSquadSelectorApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <SquadSelector />
      <Toaster />
    </div>
  )
}
