import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  Eye,
  EyeOff,
  Footprints,
  Gem,
  LogOut,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameSounds } from '../../chess/hooks/useGameSounds'
import {
  createWorld,
  escape,
  grabGold,
  moveAgent,
  percepts,
  shoot,
  solutionPath,
  type Direction,
} from '../engine/gameEngine'

const directions: { id: Direction; label: string; icon: typeof ArrowUp }[] = [
  { id: 'up', label: 'Move up', icon: ArrowUp },
  { id: 'left', label: 'Move left', icon: ArrowLeft },
  { id: 'down', label: 'Move down', icon: ArrowDown },
  { id: 'right', label: 'Move right', icon: ArrowRight },
]
export function WumpusWorldPage() {
  const [game, setGame] = useState(createWorld)
  const [aiming, setAiming] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const playSound = useGameSounds(soundOn)
  const senses = percepts(game)
  const entrance = game.agent.row === 3 && game.agent.column === 0
  const safeRoute = new Set(solutionPath(game).map((point) => `${point.row}:${point.column}`))
  function act(direction: Direction) {
    setGame((current) => {
      const next = aiming ? shoot(current, direction) : moveAgent(current, direction)
      if (aiming) playSound(next.wumpusAlive !== current.wumpusAlive ? 'game-over' : 'capture')
      else if (next.status === 'dead') playSound('capture')
      else {
        const nextSenses = percepts(next)
        playSound(nextSenses.breeze || nextSenses.stench ? 'check' : 'move')
      }
      return next
    })
    setAiming(false)
  }
  return (
    <div className="wumpus-page">
      <header className="game-header">
        <Link to="/" className="game-back">
          <ArrowLeft size={18} /> TriArcade
        </Link>
        <div className="game-title">
          <span>🕯️</span>
          <div>
            <strong>Wumpus World</strong>
            <small>Agent exploration</small>
          </div>
        </div>
        <div className="wumpus-header-actions">
          <span className="game-header-score">Score {game.score}</span>
          <button
            className="icon-button"
            type="button"
            aria-label="Toggle sound"
            onClick={() => setSoundOn(!soundOn)}
          >
            {soundOn ? <Volume2 /> : <VolumeX />}
          </button>
        </div>
      </header>
      <main className="wumpus-layout">
        <section className="cave-stage">
          <div className="cave-heading">
            <div>
              <p className="eyebrow">Knowledge-based adventure</p>
              <h1>Trust your senses.</h1>
            </div>
            <p>Explore the cave, secure the gold, and return alive.</p>
          </div>
          <div
            className={`wumpus-board ${senses.breeze ? 'feels-breeze' : ''} ${senses.stench ? 'feels-stench' : ''}`}
            role="grid"
            aria-label="Wumpus cave"
          >
            <div className="cave-grid-label cave-grid-top" aria-hidden="true">
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span>D</span>
            </div>
            {Array.from({ length: 16 }, (_, index) => {
              const row = Math.floor(index / 4),
                column = index % 4,
                k = `${row}:${column}`,
                visible = game.visited.includes(k) || showSolution,
                agent = game.agent.row === row && game.agent.column === column
              const pit = game.pits.some((point) => point.row === row && point.column === column)
              const wumpus = game.wumpus.row === row && game.wumpus.column === column
              const gold = game.gold.row === row && game.gold.column === column
              return (
                <div
                  className={`cave-cell ${visible ? 'explored' : 'hidden'} ${agent ? 'agent-cell' : ''} ${showSolution && safeRoute.has(k) ? 'solution-room' : ''} ${showSolution && pit ? 'solution-danger' : ''}`}
                  role="gridcell"
                  aria-label={`Cave room ${row + 1}, ${column + 1}${visible ? ', explored' : ', unknown'}`}
                  key={k}
                >
                  {visible && <span className="cave-floor" />}
                  <span className="room-coordinate">
                    {String.fromCharCode(65 + column)}
                    {4 - row}
                  </span>
                  {k === '3:0' && visible && (
                    <small className="exit-marker">
                      <LogOut /> EXIT
                    </small>
                  )}
                  {showSolution && pit && (
                    <div className="hazard-reveal">
                      <span>🕳️</span>
                      <em>PIT</em>
                    </div>
                  )}
                  {showSolution && wumpus && (
                    <div className={`wumpus-reveal ${game.wumpusAlive ? '' : 'defeated'}`}>
                      <span>👹</span>
                      <em>{game.wumpusAlive ? 'WUMPUS' : 'DEFEATED'}</em>
                    </div>
                  )}
                  {showSolution && gold && !game.hasGold && (
                    <div className="solution-gold">
                      <Gem />
                      <em>GOLD</em>
                    </div>
                  )}
                  {agent && (
                    <>
                      <div className="agent-token">
                        <Footprints />
                        <em>AGENT</em>
                      </div>
                      {senses.glitter && (
                        <div className="gold-in-room">
                          <Gem />
                        </div>
                      )}
                      {senses.breeze && (
                        <div className="breeze-effect" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </div>
                      )}
                      {senses.stench && (
                        <div className="stench-effect" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </div>
                      )}
                    </>
                  )}
                  {visible &&
                    game.status !== 'playing' &&
                    game.pits.some((p) => p.row === row && p.column === column) && <b>🕳️</b>}
                </div>
              )
            })}
          </div>
          <div className="sense-strip">
            <article className={senses.breeze ? 'active breeze' : ''}>
              <span>〰</span>
              <div>
                <strong>{senses.breeze ? 'Breeze detected' : 'Air is still'}</strong>
                <small>
                  {senses.breeze ? 'A pit is in an adjacent room' : 'No nearby pit detected'}
                </small>
              </div>
            </article>
            <article className={senses.stench ? 'active stench' : ''}>
              <span>◉</span>
              <div>
                <strong>{senses.stench ? 'Stench detected' : 'No stench'}</strong>
                <small>
                  {senses.stench ? 'The Wumpus is very close' : 'No nearby Wumpus detected'}
                </small>
              </div>
            </article>
            <article className={senses.glitter ? 'active glitter' : ''}>
              <Gem />
              <div>
                <strong>
                  {senses.glitter
                    ? 'Gold is glittering!'
                    : game.hasGold
                      ? 'Gold collected'
                      : 'No glitter'}
                </strong>
                <small>{game.hasGold ? 'Return to the entrance' : 'Search every safe room'}</small>
              </div>
            </article>
          </div>
        </section>
        <aside className="agent-console">
          <div className={`mission-update ${game.status}`}>
            <small>Agent report</small>
            <strong>{game.message}</strong>
          </div>
          <div className="agent-state">
            <div>
              <small>Mission</small>
              <strong>{game.hasGold ? 'Return to exit' : 'Find the gold'}</strong>
            </div>
            <span>{game.status === 'playing' ? 'ACTIVE' : game.status.toUpperCase()}</span>
          </div>
          <div className={`direction-control ${aiming ? 'aiming' : ''}`}>
            <small>{aiming ? 'Choose a direction to fire' : 'Choose the agent direction'}</small>
            <div>
              {directions.map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  aria-label={aiming ? `Shoot ${id}` : label}
                  disabled={game.status !== 'playing'}
                  onClick={() => act(id)}
                  key={id}
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>
          <div className="agent-actions">
            <button
              type="button"
              className={aiming ? 'active' : ''}
              disabled={!game.arrow || game.status !== 'playing'}
              onClick={() => setAiming(!aiming)}
            >
              <Crosshair /> {game.arrow ? 'Shoot arrow' : 'Arrow used'}
            </button>
            <button
              type="button"
              disabled={!senses.glitter}
              onClick={() => {
                setGame(grabGold)
                playSound('check')
              }}
            >
              <Gem /> Grab gold
            </button>
            <button
              type="button"
              disabled={!entrance || game.status !== 'playing'}
              onClick={() =>
                setGame((current) => {
                  const next = escape(current)
                  if (next.status === 'won') playSound('game-over')
                  return next
                })
              }
            >
              <LogOut /> Exit cave
            </button>
          </div>
          <div className="field-notes">
            <h2>Agent knowledge</h2>
            <p>
              <b>White fog</b> means a pit borders your room. <b>Purple waves</b> mean the living
              Wumpus is one move away.
            </p>
            <div>
              <span>
                Explored <strong>{game.visited.length}/16</strong>
              </span>
              <span>
                Arrow <strong>{game.arrow ? '1' : '0'}</strong>
              </span>
              <span>
                Gold <strong>{game.hasGold ? 'Yes' : 'No'}</strong>
              </span>
            </div>
          </div>
          <button
            className={`solution-toggle ${showSolution ? 'active' : ''}`}
            type="button"
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? <EyeOff /> : <Eye />} {showSolution ? 'Hide solution' : 'Show solution'}
          </button>
          <button
            className="restart-mission"
            type="button"
            onClick={() => {
              setGame(createWorld())
              setAiming(false)
              setShowSolution(false)
              playSound('restart')
            }}
          >
            <RotateCcw /> Restart mission
          </button>
        </aside>
      </main>
    </div>
  )
}
