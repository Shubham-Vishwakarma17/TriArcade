import { ArrowLeft, BookOpen, RotateCcw, Undo2, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameSounds } from '../../chess/hooks/useGameSounds'
import { ThreePlayerBoard } from '../components/ThreePlayerBoard'
import {
  applyThreePlayerMove,
  capitalize,
  createThreePlayerGame,
  gameStatus,
  isInCheck,
} from '../engine/gameEngine'
import type { Player, ThreePlayerGameState } from '../engine/types'

const players: Player[] = ['white', 'black', 'red']

export function ThreePlayerChessPage() {
  const [state, setState] = useState(createThreePlayerGame)
  const [snapshots, setSnapshots] = useState<ThreePlayerGameState[]>([])
  const [soundOn, setSoundOn] = useState(true)
  const [showRules, setShowRules] = useState(false)
  const playSound = useGameSounds(soundOn)

  function move(from: string, to: string) {
    const next = applyThreePlayerMove(state, from, to)
    if (next === state) return
    setSnapshots((current) => [...current, state])
    setState(next)
    if (next.winner) playSound('game-over')
    else if (isInCheck(next, next.turn)) playSound('check')
    else if (next.lastMove?.captured) playSound('capture')
    else playSound('move')
  }

  function undo() {
    const previous = snapshots.at(-1)
    if (!previous) return
    setState(previous)
    setSnapshots((current) => current.slice(0, -1))
    playSound('undo')
  }

  function restart() {
    setState(createThreePlayerGame())
    setSnapshots([])
    playSound('restart')
  }

  return (
    <div className="three-game-page">
      <header className="game-header">
        <Link to="/" className="game-back">
          <ArrowLeft size={18} /> TriArcade
        </Link>
        <div className="game-title">
          <span>♛</span>
          <div>
            <strong>Three-Player Chess</strong>
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

      <main className="three-game-layout">
        <section className="three-board-panel">
          <ThreePlayerBoard state={state} onMove={move} />
        </section>
        <aside className="three-sidebar">
          <div className={`three-status ${state.winner ? 'winner' : ''}`}>
            <small>Match status</small>
            <strong>{gameStatus(state)}</strong>
          </div>

          <div className="three-players">
            {players.map((player) => {
              const eliminated = state.eliminated.includes(player)
              return (
                <article
                  className={`${player} ${state.turn === player && !state.winner ? 'active' : ''} ${eliminated ? 'eliminated' : ''}`}
                  key={player}
                >
                  <span className="three-player-king">{player === 'white' ? '♔' : '♚'}</span>
                  <div>
                    <strong>{capitalize(player)} Player</strong>
                    <small>
                      {eliminated
                        ? 'Eliminated'
                        : state.turn === player
                          ? 'Your turn'
                          : isInCheck(state, player)
                            ? 'In check'
                            : 'Waiting'}
                    </small>
                  </div>
                  <span className="three-player-dot" />
                </article>
              )
            })}
          </div>

          <div className="three-history">
            <div className="panel-heading">
              <span>Move history</span>
              <small>{state.history.length} moves</small>
            </div>
            <div>
              {state.history.length ? (
                state.history.map((move, index) => (
                  <p key={`${move.from}-${move.to}-${index}`}>
                    <span>{index + 1}</span>
                    <i className={move.piece.player} /> <strong>{move.notation}</strong>
                  </p>
                ))
              ) : (
                <div className="empty-moves">White moves first. Select a piece to begin.</div>
              )}
            </div>
          </div>

          <div className="three-controls">
            <button type="button" onClick={undo} disabled={!snapshots.length}>
              <Undo2 size={16} /> Undo
            </button>
            <button type="button" onClick={restart}>
              <RotateCcw size={16} /> Restart
            </button>
            <button type="button" onClick={() => setShowRules(true)}>
              <BookOpen size={16} /> Rules
            </button>
          </div>
        </aside>
      </main>

      {showRules && (
        <div className="promotion-backdrop" onClick={() => setShowRules(false)}>
          <section
            className="three-rules"
            role="dialog"
            aria-modal="true"
            aria-label="Three-player chess rules"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">How to play</p>
            <h2>Three armies. One survivor.</h2>
            <ul>
              <li>Turns rotate White → Black → Red.</li>
              <li>
                Pieces use familiar chess movement and follow the board lines through the center.
              </li>
              <li>
                Pawns move away from their home rank, capture diagonally, and promote on either
                opponent’s back rank.
              </li>
              <li>You must respond to check. A checkmated player is eliminated.</li>
              <li>The last player with a king wins.</li>
            </ul>
            <button className="primary-button" type="button" onClick={() => setShowRules(false)}>
              Start playing
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
