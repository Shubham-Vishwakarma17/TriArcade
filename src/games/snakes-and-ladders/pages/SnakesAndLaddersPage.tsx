import { ArrowLeft, BookOpen, Dices, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useGameSounds } from '../../chess/hooks/useGameSounds'
import { RaceBoard } from '../components/RaceBoard'
import { createSnakesGame, describeTurn, playRoll } from '../engine/gameEngine'
import type { SnakesGameState } from '../engine/types'

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export function SnakesAndLaddersPage() {
  const [playerCount, setPlayerCount] = useState(2)
  const [names, setNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4'])
  const [game, setGame] = useState<SnakesGameState | null>(null)
  const [rolling, setRolling] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [showRules, setShowRules] = useState(false)
  const rollTimer = useRef<number | null>(null)
  const playSound = useGameSounds(soundOn)

  useEffect(
    () => () => {
      if (rollTimer.current !== null) window.clearTimeout(rollTimer.current)
    },
    [],
  )

  function cancelPendingRoll() {
    if (rollTimer.current !== null) window.clearTimeout(rollTimer.current)
    rollTimer.current = null
    setRolling(false)
  }

  function startGame() {
    setGame(createSnakesGame(names.slice(0, playerCount)))
  }

  function roll() {
    if (!game || rolling || game.winnerId !== null) return
    setRolling(true)
    rollTimer.current = window.setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1
      const next = playRoll(game, value)
      setGame(next)
      setRolling(false)
      rollTimer.current = null
      if (next.winnerId !== null) playSound('game-over')
      else if (next.turn?.event === 'snake') playSound('capture')
      else if (next.turn?.event === 'ladder') playSound('check')
      else playSound('move')
    }, 420)
  }

  return (
    <div className="snakes-page">
      <header className="game-header">
        <Link to="/" className="game-back">
          <ArrowLeft size={18} /> TriArcade
        </Link>
        <div className="game-title">
          <span>🎲</span>
          <div>
            <strong>Snakes & Ladders</strong>
            <small>Local race</small>
          </div>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label="Toggle sound"
          aria-pressed={soundOn}
          onClick={() => setSoundOn(!soundOn)}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </header>

      {!game ? (
        <main className="race-setup">
          <section>
            <p className="eyebrow">New local game</p>
            <h1>Race to the top.</h1>
            <p>
              Climb every ladder, dodge every snake, and be the first player to land exactly on
              square 100.
            </p>
          </section>
          <div className="setup-card">
            <label>Number of players</label>
            <div className="count-picker">
              {[2, 3, 4].map((count) => (
                <button
                  className={playerCount === count ? 'active' : ''}
                  type="button"
                  onClick={() => setPlayerCount(count)}
                  key={count}
                >
                  {count} players
                </button>
              ))}
            </div>
            <div className="name-fields">
              {names.slice(0, playerCount).map((name, index) => (
                <label key={index}>
                  <span style={{ background: ['#8b5cf6', '#22d3ee', '#fb7185', '#fbbf24'][index] }}>
                    {index + 1}
                  </span>
                  <input
                    aria-label={`Player ${index + 1} name`}
                    value={name}
                    maxLength={18}
                    onChange={(event) =>
                      setNames((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      )
                    }
                  />
                </label>
              ))}
            </div>
            <button className="primary-button setup-start" type="button" onClick={startGame}>
              <Dices size={19} /> Start the race
            </button>
          </div>
        </main>
      ) : (
        <main className="race-layout">
          <section className="race-board-panel">
            <RaceBoard players={game.players} />
            <div className="start-dock">
              <small>START</small>
              {game.players
                .filter((player) => player.position === 0)
                .map((player) => (
                  <span style={{ '--token': player.color } as CSSProperties} key={player.id}>
                    {player.id + 1}
                  </span>
                ))}
            </div>
          </section>
          <aside className="race-sidebar">
            <div className="race-message">
              <small>Game update</small>
              <strong>{describeTurn(game)}</strong>
            </div>
            <div className={`dice-card ${rolling ? 'rolling' : ''}`}>
              <span className="dice-face">
                {rolling ? '✦' : game.lastRoll ? diceFaces[game.lastRoll - 1] : '⚄'}
              </span>
              <div>
                <small>Current player</small>
                <strong style={{ color: game.players[game.currentPlayer].color }}>
                  {game.winnerId !== null
                    ? game.players[game.winnerId].name
                    : game.players[game.currentPlayer].name}
                </strong>
              </div>
              <button type="button" onClick={roll} disabled={rolling || game.winnerId !== null}>
                {rolling ? 'Rolling…' : 'Roll dice'}
              </button>
            </div>
            <div className="race-players">
              {game.players.map((player) => (
                <article
                  className={
                    game.currentPlayer === player.id && game.winnerId === null ? 'active' : ''
                  }
                  style={{ '--player': player.color } as CSSProperties}
                  key={player.id}
                >
                  <span>{player.id + 1}</span>
                  <div>
                    <strong>{player.name}</strong>
                    <small>{player.position ? `Square ${player.position}` : 'At the start'}</small>
                  </div>
                  <b>{player.position}</b>
                </article>
              ))}
            </div>
            <div className="race-history">
              <div className="panel-heading">
                <span>Recent rolls</span>
                <small>{game.history.length} turns</small>
              </div>
              <div>
                {game.history.length ? (
                  [...game.history]
                    .reverse()
                    .slice(0, 8)
                    .map((turn, index) => {
                      const player = game.players[turn.playerId]
                      return (
                        <p key={game.history.length - index}>
                          <i style={{ background: player.color }} />
                          <span>{player.name}</span>
                          <strong>{turn.roll}</strong>
                          <small>
                            {turn.event === 'ladder'
                              ? `🪜 ${turn.to}`
                              : turn.event === 'snake'
                                ? `🐍 ${turn.to}`
                                : turn.event === 'overshoot'
                                  ? 'Exact roll needed'
                                  : `→ ${turn.to}`}
                          </small>
                        </p>
                      )
                    })
                ) : (
                  <div className="empty-moves">Roll the dice to start the race.</div>
                )}
              </div>
            </div>
            <div className="race-controls">
              <button
                type="button"
                onClick={() => {
                  cancelPendingRoll()
                  setGame(createSnakesGame(game.players.map((player) => player.name)))
                  playSound('restart')
                }}
              >
                <RotateCcw size={16} /> Restart
              </button>
              <button type="button" onClick={() => setShowRules(true)}>
                <BookOpen size={16} /> Rules
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelPendingRoll()
                  setGame(null)
                }}
              >
                New players
              </button>
            </div>
          </aside>
        </main>
      )}

      {game?.winnerId !== null && game?.winnerId !== undefined && (
        <div className="winner-celebration">
          {Array.from({ length: 18 }, (_, index) => (
            <i
              style={
                {
                  '--delay': `${(index % 6) * 0.12}s`,
                  '--x': `${8 + ((index * 17) % 84)}%`,
                  '--confetti': ['#8b5cf6', '#22d3ee', '#fb7185', '#fbbf24'][index % 4],
                } as CSSProperties
              }
              key={index}
            />
          ))}
          <section>
            <span>🏆</span>
            <p className="eyebrow">We have a winner</p>
            <h2>{game.players[game.winnerId].name}</h2>
            <p>First to conquer square 100!</p>
            <div>
              <button
                type="button"
                onClick={() => {
                  setGame(createSnakesGame(game.players.map((player) => player.name)))
                  playSound('restart')
                }}
              >
                Play again
              </button>
              <button type="button" onClick={() => setGame(null)}>
                New players
              </button>
            </div>
          </section>
        </div>
      )}

      {showRules && (
        <div className="promotion-backdrop" onClick={() => setShowRules(false)}>
          <section
            className="three-rules"
            role="dialog"
            aria-modal="true"
            aria-label="Snakes and Ladders rules"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">How to play</p>
            <h2>First to 100 wins.</h2>
            <ul>
              <li>Players take turns rolling one die.</li>
              <li>Land at the bottom of a ladder to climb it.</li>
              <li>Land on a snake’s head to slide down.</li>
              <li>Roll a six to take another turn.</li>
              <li>You must roll the exact number needed to reach square 100.</li>
            </ul>
            <button className="primary-button" type="button" onClick={() => setShowRules(false)}>
              Got it
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
