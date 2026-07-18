import { ArrowLeft, Construction } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

const titles: Record<string, string> = {
  chess: 'Classic Chess',
  'three-player-chess': 'Three-Player Chess',
  ludo: 'Ludo',
  'snakes-and-ladders': 'Snakes & Ladders',
}

export function GamePlaceholder() {
  const { gameId = '' } = useParams()
  const title = titles[gameId] ?? 'Game'
  return (
    <main className="centered-page">
      <div className="placeholder-icon">
        <Construction size={36} />
      </div>
      <p className="eyebrow">Development mode</p>
      <h1>{title}</h1>
      <p>The arena is ready. This game engine is next on our roadmap.</p>
      <Link className="secondary-button" to="/">
        <ArrowLeft size={18} /> Back to the arena
      </Link>
    </main>
  )
}
