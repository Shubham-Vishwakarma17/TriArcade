import { ArrowRight, Bot, Crown, Dice5, Gamepad2, Grid3X3, Swords, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'

const games = [
  {
    id: 'chess',
    title: 'Classic Chess',
    description: 'A complete two-player chess match with legal moves, check, and checkmate.',
    icon: Crown,
    meta: '2 players',
    accent: 'gold',
    mark: '♟',
  },
  {
    id: 'three-player-chess',
    title: 'Three-Player Chess',
    description: 'Three armies compete on a custom board built for this unusual chess variant.',
    icon: Swords,
    meta: '3 players',
    accent: 'violet',
    mark: '♞',
  },
  {
    id: 'ludo',
    title: 'Ludo Royale',
    description: 'Roll, race, capture, and bring all four tokens safely into your home.',
    icon: Dice5,
    meta: '2–4 players',
    accent: 'rose',
    mark: '⚄',
  },
  {
    id: 'snakes-and-ladders',
    title: 'Snakes & Ladders',
    description: 'A quick local race with animated movement, ladders, snakes, and exact finishes.',
    icon: Zap,
    meta: '2–4 players',
    accent: 'cyan',
    mark: '↗',
  },
  {
    id: 'n-queens',
    title: 'N-Queens',
    description: 'Place queens without conflicts on boards ranging from 4×4 to 10×10.',
    icon: Grid3X3,
    meta: 'Solo puzzle',
    accent: 'indigo',
    mark: '♛',
  },
  {
    id: 'wumpus-world',
    title: 'Wumpus World',
    description: 'Explore a random cave using breeze, stench, and glitter to find the gold.',
    icon: Bot,
    meta: 'Solo adventure',
    accent: 'emerald',
    mark: '◈',
  },
]

export function HomePage() {
  return (
    <div className="app-shell home-page">
      <AppHeader />
      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-kicker">
              <i /> Six games. No sign-up.
            </span>
            <h1>
              Pick a board.
              <br />
              <span>Start playing.</span>
            </h1>
            <p>
              TriArcade is a browser collection of classic board games and logic puzzles, designed
              for local play.
            </p>
            <div className="home-hero-actions">
              <a className="home-play-button" href="#games">
                Browse games <ArrowRight />
              </a>
              <Link to="/games/chess">Play chess</Link>
            </div>
          </div>
          <div className="home-board-preview" aria-hidden="true">
            <div className="preview-grid">
              {['♜', '', '', '♚', '', '♟', '', '', '♙', '', '♛', '', '', '♘', '', ''].map(
                (piece, index) => (
                  <span
                    className={(Math.floor(index / 4) + (index % 4)) % 2 ? 'dark' : ''}
                    key={index}
                  >
                    {piece}
                  </span>
                ),
              )}
            </div>
            <div className="preview-note">
              <strong>6</strong>
              <span>
                playable
                <br />
                games
              </span>
            </div>
          </div>
        </section>

        <section className="home-games" id="games">
          <div className="home-section-title">
            <div>
              <span>Game library</span>
              <h2>What do you want to play?</h2>
            </div>
            <p>All games run directly in your browser.</p>
          </div>
          <div className="home-game-grid">
            {games.map(({ id, title, description, icon: Icon, meta, accent, mark }, index) => (
              <Link className={`home-game-card ${accent}`} to={`/games/${id}`} key={id}>
                <div className="home-card-number">0{index + 1}</div>
                <div className="home-card-mark">{mark}</div>
                <span className="home-game-icon">
                  <Icon />
                </span>
                <div className="home-card-copy">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <div className="home-card-footer">
                  <span>
                    <Users /> {meta}
                  </span>
                  <strong>
                    Play <ArrowRight />
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <div className="brand">
          <span className="brand-mark">
            <Gamepad2 size={20} />
          </span>
          <span>
            Tri<span>Arcade</span>
          </span>
        </div>
        <p>Built by Shubham Vishwakarma · React + TypeScript</p>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
