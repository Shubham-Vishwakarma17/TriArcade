import { ArrowLeft, Flag, RotateCcw, Undo2, Users, Volume2, VolumeX } from 'lucide-react'
import type { Move, PieceSymbol } from 'chess.js'
import { Chess } from 'chess.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChessBoard } from '../components/ChessBoard'
import { getCheckedKingSquare, getGameStatus, pieceAsset, pieceNames } from '../engine/chessEngine'
import { useGameSounds } from '../hooks/useGameSounds'

const startingCaptured: PieceSymbol[] = []

export function ChessPage() {
  const [game] = useState(() => new Chess())
  const [, setPosition] = useState(game.fen())
  const [flipped, setFlipped] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const playSound = useGameSounds(soundOn)

  const history = game.history({ verbose: true })
  const lastMove = history.at(-1) ?? null
  const status = getGameStatus(game)
  const checkedKing = getCheckedKingSquare(game)

  const captured = history.reduce(
    (result, move) => {
      if (move.captured) result[move.color === 'w' ? 'black' : 'white'].push(move.captured)
      return result
    },
    { white: [...startingCaptured], black: [...startingCaptured] },
  )

  function syncPosition(move?: Move) {
    setPosition(game.fen())
    if (!move) return
    if (game.isGameOver()) playSound('game-over')
    else if (game.isCheck()) playSound('check')
    else if (move.captured) playSound('capture')
    else playSound('move')
  }

  function undoMove() {
    if (game.undo()) {
      syncPosition()
      playSound('undo')
    }
  }

  function restartGame() {
    game.reset()
    syncPosition()
    playSound('restart')
    setConfirmRestart(false)
  }

  return (
    <div className="chess-page">
      <header className="game-header">
        <Link to="/" className="game-back">
          <ArrowLeft size={18} /> TriArcade
        </Link>
        <div className="game-title">
          <span>♛</span>
          <div>
            <strong>Classic Chess</strong>
            <small>Local match</small>
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

      <main className="chess-layout">
        <section className="board-column">
          <PlayerBar color="black" active={game.turn() === 'b'} captured={captured.white} />
          <ChessBoard
            game={game}
            flipped={flipped}
            checkedKing={checkedKing}
            lastMove={lastMove}
            onMove={syncPosition}
          />
          <PlayerBar color="white" active={game.turn() === 'w'} captured={captured.black} />
        </section>

        <aside className="game-sidebar">
          <div className={`turn-card ${game.isCheck() ? 'check' : ''}`}>
            <span className={`player-dot ${game.turn() === 'w' ? 'white' : 'black'}`} />
            <div>
              <small>Game status</small>
              <strong>{status}</strong>
            </div>
          </div>

          <div className="moves-panel">
            <div className="panel-heading">
              <span>Move history</span>
              <small>{history.length} moves</small>
            </div>
            <div className="move-list">
              {history.length === 0 ? (
                <div className="empty-moves">Select a piece to begin the match.</div>
              ) : (
                groupMoves(history).map(([white, black], index) => (
                  <div className="move-row" key={index}>
                    <span>{index + 1}.</span>
                    <strong>{white?.san}</strong>
                    <strong>{black?.san ?? ''}</strong>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="game-controls">
            <button type="button" onClick={undoMove} disabled={!history.length}>
              <Undo2 size={17} /> Undo
            </button>
            <button type="button" onClick={() => setFlipped(!flipped)}>
              <RotateCcw size={17} /> Flip board
            </button>
            <button
              className="danger-control"
              type="button"
              onClick={() => setConfirmRestart(true)}
            >
              <Flag size={17} /> Restart
            </button>
          </div>
          <div className="local-badge">
            <Users size={16} />
            <span>
              <strong>Pass & play</strong>
              <small>Two players on this device</small>
            </span>
          </div>
        </aside>
      </main>

      {confirmRestart && (
        <div className="promotion-backdrop">
          <div className="confirm-dialog" role="dialog" aria-modal="true" aria-label="Restart game">
            <h2>Restart this match?</h2>
            <p>The current position and move history will be cleared.</p>
            <div>
              <button type="button" onClick={() => setConfirmRestart(false)}>
                Keep playing
              </button>
              <button className="confirm-danger" type="button" onClick={restartGame}>
                Restart game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function groupMoves(history: Move[]) {
  const rows: Array<[Move | undefined, Move | undefined]> = []
  for (let index = 0; index < history.length; index += 2)
    rows.push([history[index], history[index + 1]])
  return rows
}

function PlayerBar({
  color,
  active,
  captured,
}: {
  color: 'white' | 'black'
  active: boolean
  captured: PieceSymbol[]
}) {
  const assetColor = color === 'white' ? 'w' : 'b'
  return (
    <div className={`player-bar ${active ? 'active' : ''}`}>
      <div className={`player-avatar ${color}`}>{color === 'white' ? '♔' : '♚'}</div>
      <div className="player-info">
        <strong>{color === 'white' ? 'White Player' : 'Black Player'}</strong>
        <span>{active ? 'Thinking…' : 'Waiting'}</span>
      </div>
      <div className="captured-pieces">
        {captured.map((piece, index) => (
          <img
            src={pieceAsset(assetColor, piece)}
            alt={`Captured ${pieceNames[piece]}`}
            key={`${piece}-${index}`}
          />
        ))}
      </div>
      {active && <span className="active-turn">Your turn</span>}
    </div>
  )
}
