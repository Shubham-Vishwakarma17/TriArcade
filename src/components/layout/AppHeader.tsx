import { Gamepad2, GitBranch, Volume2 } from 'lucide-react'
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
        <a href="#features">Features</a>
        <a href="#roadmap">Roadmap</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button" type="button" aria-label="Sound settings">
          <Volume2 size={19} />
        </button>
        <a className="icon-button" href="#roadmap" aria-label="Development roadmap">
          <GitBranch size={19} />
        </a>
      </div>
    </header>
  )
}
