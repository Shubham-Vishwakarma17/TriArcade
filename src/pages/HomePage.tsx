import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Crown,
  Dice5,
  Gamepad2,
  Sparkles,
  Swords,
  Users,
  Wifi,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'

const games = [
  {
    id: 'chess',
    title: 'Classic Chess',
    description:
      'The timeless battle of strategy. Play locally, challenge the AI, or invite a friend.',
    icon: Crown,
    meta: '2 players',
    status: 'Building first',
    accent: 'gold',
  },
  {
    id: 'three-player-chess',
    title: 'Three-Player Chess',
    description: 'Three armies. One board. Alliances shift and every move changes the balance.',
    icon: Swords,
    meta: '3 players',
    status: 'Signature game',
    accent: 'violet',
  },
  {
    id: 'ludo',
    title: 'Ludo',
    description: 'Race your tokens home in a colorful classic full of rivalry and lucky turns.',
    icon: Dice5,
    meta: '2–4 players',
    status: 'Planned',
    accent: 'rose',
  },
  {
    id: 'snakes-and-ladders',
    title: 'Snakes & Ladders',
    description: 'Climb, slide, and race to the finish in a fast game for everyone.',
    icon: Zap,
    meta: '2–4 players',
    status: 'Planned',
    accent: 'cyan',
  },
]

export function HomePage() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main>
        <section className="hero">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <div className="hero-copy">
            <p className="eyebrow">
              <Sparkles size={16} /> Classic games. A new arena.
            </p>
            <h1>
              Every move tells <span>a story.</span>
            </h1>
            <p className="hero-lead">
              Gather your friends and rediscover the games you love in one beautiful, competitive
              playground.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#games">
                Explore games <ArrowRight size={18} />
              </a>
              <Link className="secondary-button" to="/games/chess">
                See our first build
              </Link>
            </div>
            <div className="hero-trust">
              <span>
                <Check size={15} /> Local multiplayer
              </span>
              <span>
                <Check size={15} /> Mobile friendly
              </span>
              <span>
                <Check size={15} /> Free to play
              </span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one">
              <span />
            </div>
            <div className="orbit orbit-two">
              <span />
            </div>
            <div className="piece-card piece-card-back">
              <img src="/assets/pieces/red_knight.svg" alt="" />
            </div>
            <div className="piece-card piece-card-front">
              <img src="/assets/pieces/white_king.svg" alt="" />
              <span className="turn-pill">
                <span /> Your move
              </span>
            </div>
            <div className="floating-die">⚄</div>
          </div>
        </section>

        <section className="section games-section" id="games">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Choose your challenge</p>
              <h2>Four classics. Endless rivalries.</h2>
            </div>
            <p>
              We are building each game as a focused, polished experience inside one shared arena.
            </p>
          </div>
          <div className="game-grid">
            {games.map(({ id, title, description, icon: Icon, meta, status, accent }) => (
              <Link className={`game-card ${accent}`} to={`/games/${id}`} key={id}>
                <div className="game-card-top">
                  <span className="game-icon">
                    <Icon size={28} />
                  </span>
                  <span className="status-pill">{status}</span>
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <div className="game-card-footer">
                  <span>
                    <Users size={16} /> {meta}
                  </span>
                  <ChevronRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section feature-section" id="features">
          <div className="feature-copy">
            <p className="eyebrow">Built for game night</p>
            <h2>
              Simple to start.
              <br />
              Hard to put down.
            </h2>
            <p>
              Every part of TriArcade is designed to keep players focused on the match—not menus and
              setup.
            </p>
          </div>
          <div className="feature-list">
            <article>
              <span>
                <Gamepad2 />
              </span>
              <div>
                <h3>Play together</h3>
                <p>Pass-and-play locally with fast setup and clear turn indicators.</p>
              </div>
            </article>
            <article>
              <span>
                <Bot />
              </span>
              <div>
                <h3>Smart opponents</h3>
                <p>Practice against computer players with approachable difficulty levels.</p>
              </div>
            </article>
            <article>
              <span>
                <Wifi />
              </span>
              <div>
                <h3>Online rooms</h3>
                <p>Create a private room and invite friends when online play arrives.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section roadmap" id="roadmap">
          <p className="eyebrow">Development roadmap</p>
          <h2>Building the right foundations first.</h2>
          <div className="roadmap-track">
            <div className="roadmap-item active">
              <span>01</span>
              <h3>Platform foundation</h3>
              <p>Design system, routing, testing and responsive shell.</p>
            </div>
            <div className="roadmap-item">
              <span>02</span>
              <h3>Classic chess</h3>
              <p>Complete rules engine and polished local play.</p>
            </div>
            <div className="roadmap-item">
              <span>03</span>
              <h3>Three-player chess</h3>
              <p>Our signature board with tested variant rules.</p>
            </div>
            <div className="roadmap-item">
              <span>04</span>
              <h3>More games</h3>
              <p>Snakes & Ladders, Ludo, AI and online rooms.</p>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="brand">
          <span className="brand-mark">
            <Gamepad2 size={20} />
          </span>
          <span>
            Tri<span>Arcade</span>
          </span>
        </div>
        <p>Built with strategy, luck, and friendly competition.</p>
        <span>© {new Date().getFullYear()} TriArcade</span>
      </footer>
    </div>
  )
}
