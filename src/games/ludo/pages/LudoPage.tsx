import { ArrowLeft, BookOpen, Dices, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useGameSounds } from '../../chess/hooks/useGameSounds'
import { LudoBoard } from '../components/LudoBoard'
import { createLudoGame, moveLudoToken, rollLudoDice } from '../engine/gameEngine'
import type { LudoState } from '../engine/types'

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const playerColors = ['#ef4444', '#22c55e', '#eab308', '#3b82f6']

export function LudoPage() {
  const [playerCount, setPlayerCount] = useState(4)
  const [names, setNames] = useState(['Red Player', 'Green Player', 'Yellow Player', 'Blue Player'])
  const [game, setGame] = useState<LudoState | null>(null)
  const [rolling, setRolling] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [showRules, setShowRules] = useState(false)
  const timer = useRef<number | null>(null)
  const playSound = useGameSounds(soundOn)
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  function cancelRoll() {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    setRolling(false)
  }
  function start() {
    setGame(createLudoGame(names.slice(0, playerCount)))
  }
  function roll() {
    if (!game || game.phase !== 'roll' || rolling) return
    setRolling(true)
    timer.current = window.setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1
      const next = rollLudoDice(game, value)
      setGame(next)
      setRolling(false)
      timer.current = null
      playSound('move')
    }, 420)
  }
  function moveToken(tokenId: number) {
    if (!game) return
    const next = moveLudoToken(game, tokenId)
    setGame(next)
    const event = next.history.at(-1)?.message ?? ''
    if (next.winnerId !== null) playSound('game-over')
    else if (event.includes('captured')) playSound('capture')
    else if (event.includes('home')) playSound('check')
    else playSound('move')
  }
  function resetGame() {
    if (!game) return
    cancelRoll()
    setGame(createLudoGame(game.players.map((player) => player.name)))
    playSound('restart')
  }

  return (
    <div className="ludo-page">
      <header className="game-header">
        <Link to="/" className="game-back">
          <ArrowLeft size={18} /> TriArcade
        </Link>
        <div className="game-title">
          <span>◉</span>
          <div>
            <strong>Ludo Royale</strong>
            <small>Local pass & play</small>
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
        <main className="ludo-setup">
          <section>
            <p className="eyebrow">The final classic</p>
            <h1>Bring every token home.</h1>
            <p>
              Release your pieces, race around the board, send rivals back to their yard, and rule
              the center.
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
                  <span style={{ background: playerColors[index] }}>{index + 1}</span>
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
            <button className="primary-button setup-start" type="button" onClick={start}>
              <Dices size={19} /> Start Ludo
            </button>
          </div>
        </main>
      ) : (
        <main className="ludo-layout">
          <section className="ludo-board-panel">
            <LudoBoard state={game} onToken={moveToken} />
          </section>
          <aside className="ludo-sidebar">
            <div className="ludo-message">
              <small>Match update</small>
              <strong>{game.message}</strong>
            </div>
            <div className={`dice-card ludo-dice ${rolling ? 'rolling' : ''}`}>
              <span className="dice-face">
                {rolling ? '✦' : game.dice ? diceFaces[game.dice - 1] : '⚄'}
              </span>
              <div>
                <small>Current player</small>
                <strong style={{ color: playerColors[game.currentPlayer] }}>
                  {game.players[game.currentPlayer].name}
                </strong>
              </div>
              <button type="button" onClick={roll} disabled={rolling || game.phase !== 'roll'}>
                {game.phase === 'move' ? 'Choose a token' : rolling ? 'Rolling…' : 'Roll dice'}
              </button>
            </div>
            <div className="ludo-players">
              {game.players.map((player) => {
                const home = player.tokens.filter((token) => token.progress === 58).length
                return (
                  <article
                    className={
                      game.currentPlayer === player.id && game.winnerId === null ? 'active' : ''
                    }
                    style={{ '--player': playerColors[player.id] } as CSSProperties}
                    key={player.id}
                  >
                    <span>{player.id + 1}</span>
                    <div>
                      <strong>{player.name}</strong>
                      <small>{home}/4 tokens home</small>
                    </div>
                    <b>
                      {'●'.repeat(home)}
                      {'○'.repeat(4 - home)}
                    </b>
                  </article>
                )
              })}
            </div>
            <div className="ludo-history">
              <div className="panel-heading">
                <span>Match history</span>
                <small>{game.history.length} actions</small>
              </div>
              <div>
                {game.history.length ? (
                  [...game.history]
                    .reverse()
                    .slice(0, 8)
                    .map((event, index) => (
                      <p key={game.history.length - index}>
                        <i style={{ background: playerColors[event.playerId] }} />
                        <span>{event.message}</span>
                        <strong>{event.roll}</strong>
                      </p>
                    ))
                ) : (
                  <div className="empty-moves">Roll a six to release your first token.</div>
                )}
              </div>
            </div>
            <div className="race-controls">
              <button type="button" onClick={resetGame}>
                <RotateCcw size={16} /> Restart
              </button>
              <button type="button" onClick={() => setShowRules(true)}>
                <BookOpen size={16} /> Rules
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelRoll()
                  setGame(null)
                }}
              >
                New players
              </button>
            </div>
          </aside>
        </main>
      )}
      {showRules && (
        <div className="promotion-backdrop" onClick={() => setShowRules(false)}>
          <section
            className="three-rules"
            role="dialog"
            aria-modal="true"
            aria-label="Ludo rules"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">How to play</p>
            <h2>Race every token home.</h2>
            <ul>
              <li>Roll a six to move a token out of your yard.</li>
              <li>A six, capture, or token reaching home earns another roll.</li>
              <li>Landing on a rival sends it back unless the square has a star.</li>
              <li>Three consecutive sixes forfeit the turn.</li>
              <li>
                Tokens need an exact roll to reach the center. First to bring all four home wins.
              </li>
            </ul>
            <button className="primary-button" type="button" onClick={() => setShowRules(false)}>
              Let’s play
            </button>
          </section>
        </div>
      )}
      {game?.winnerId !== null && game?.winnerId !== undefined && (
        <div className="winner-celebration">
          <section>
            <span>👑</span>
            <p className="eyebrow">Ludo champion</p>
            <h2>{game.players[game.winnerId].name}</h2>
            <p>All four tokens made it home.</p>
            <div>
              <button type="button" onClick={resetGame}>
                Play again
              </button>
              <button type="button" onClick={() => setGame(null)}>
                New players
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
