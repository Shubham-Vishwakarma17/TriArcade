import type { Color, Move, PieceSymbol, Square } from 'chess.js'
import { Chess } from 'chess.js'
import { useState } from 'react'
import { pieceAsset, pieceNames } from '../engine/chessEngine'

type PendingPromotion = { from: Square; to: Square }

interface ChessBoardProps {
  game: Chess
  flipped: boolean
  checkedKing: Square | null
  lastMove: { from: Square; to: Square } | null
  onMove: (move: Move) => void
}

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'] as const
const promotionPieces: PieceSymbol[] = ['q', 'r', 'b', 'n']

export function ChessBoard({ game, flipped, checkedKing, lastMove, onMove }: ChessBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null)

  const legalTargets = selected
    ? new Set(game.moves({ square: selected, verbose: true }).map((move) => move.to))
    : new Set<Square>()

  const orderedFiles = flipped ? [...files].reverse() : files
  const orderedRanks = flipped ? [...ranks].reverse() : ranks

  function completeMove(from: Square, to: Square, promotion?: PieceSymbol) {
    const move = game.move({ from, to, promotion })
    setSelected(null)
    setPendingPromotion(null)
    onMove(move)
  }

  function selectSquare(square: Square) {
    if (game.isGameOver()) return
    const piece = game.get(square)

    if (selected && legalTargets.has(square)) {
      const movingPiece = game.get(selected)
      const needsPromotion =
        movingPiece?.type === 'p' && (square.endsWith('8') || square.endsWith('1'))
      if (needsPromotion) setPendingPromotion({ from: selected, to: square })
      else completeMove(selected, square)
      return
    }

    setSelected(piece?.color === game.turn() ? square : null)
  }

  return (
    <div className="chessboard-wrap">
      <div className="chessboard" role="grid" aria-label="Chess board">
        {orderedRanks.flatMap((rank, displayRankIndex) =>
          orderedFiles.map((file, displayFileIndex) => {
            const square = `${file}${rank}` as Square
            const piece = game.get(square)
            const isLight = (files.indexOf(file) + Number(rank)) % 2 === 1
            const isSelected = selected === square
            const isLegal = legalTargets.has(square)
            const isLastMove = lastMove?.from === square || lastMove?.to === square
            const label = piece
              ? `${square}, ${piece.color === 'w' ? 'white' : 'black'} ${pieceNames[piece.type]}`
              : `${square}, empty`

            return (
              <button
                className={`chess-square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isLastMove ? 'last-move' : ''} ${checkedKing === square ? 'in-check' : ''}`}
                type="button"
                role="gridcell"
                aria-label={label}
                aria-pressed={isSelected}
                onClick={() => selectSquare(square)}
                key={square}
              >
                {displayRankIndex === 7 && <span className="file-label">{file}</span>}
                {displayFileIndex === 0 && <span className="rank-label">{rank}</span>}
                {piece && (
                  <img
                    className="chess-piece"
                    src={pieceAsset(piece.color, piece.type)}
                    alt=""
                    draggable="false"
                  />
                )}
                {isLegal && <span className={piece ? 'capture-target' : 'move-target'} />}
              </button>
            )
          }),
        )}
      </div>

      {pendingPromotion && (
        <div className="promotion-backdrop" role="presentation">
          <div
            className="promotion-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Choose promotion piece"
          >
            <p>Promote your pawn</p>
            <div>
              {promotionPieces.map((piece) => (
                <button
                  type="button"
                  aria-label={`Promote to ${pieceNames[piece]}`}
                  onClick={() => completeMove(pendingPromotion.from, pendingPromotion.to, piece)}
                  key={piece}
                >
                  <img src={pieceAsset(game.turn() as Color, piece)} alt="" />
                </button>
              ))}
            </div>
            <button
              className="cancel-promotion"
              type="button"
              onClick={() => setPendingPromotion(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
