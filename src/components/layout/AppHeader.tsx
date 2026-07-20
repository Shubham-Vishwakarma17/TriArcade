import { Gamepad2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="TriArcade home">
        <span className="brand-mark">
          <Gamepad2 size={24} />
        </span>
        <span>
          Tri<span>Arcade</span>
        </span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <a href="#games">Games</a>
        <Link to="/games/chess">Chess</Link>
        <Link to="/games/wumpus-world">Wumpus World</Link>
      </nav>
      <div className="header-actions">
        <a
          className="header-source-link"
          href="https://github.com/Shubham-Vishwakarma17/TriArcade"
          target="_blank"
          rel="noreferrer"
          aria-label="TriArcade source code on GitHub"
        >
          Source
        </a>
      </div>
    </header>
  )
}
