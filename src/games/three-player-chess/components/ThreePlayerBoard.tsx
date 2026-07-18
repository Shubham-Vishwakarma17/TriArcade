import { useState } from 'react'
import { boardSquares } from '../engine/boardData'
import { legalTargets } from '../engine/gameEngine'
import { centers } from '../engine/topology'
import type { ThreePlayerGameState } from '../engine/types'

interface ThreePlayerBoardProps {
  state: ThreePlayerGameState
  onMove: (from: string, to: string) => void
}

export function ThreePlayerBoard({ state, onMove }: ThreePlayerBoardProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const targets = selected ? legalTargets(state, selected) : []

  function activate(squareId: string) {
    if (selected && targets.includes(squareId)) {
      onMove(selected, squareId)
      setSelected(null)
      return
    }
    setSelected(state.pieces[squareId]?.player === state.turn ? squareId : null)
  }

  return (
    <svg
      className="three-board"
      viewBox="0 0 960 831.3844"
      role="grid"
      aria-label="Three-player chess board"
    >
      {boardSquares.map((square) => {
        const piece = state.pieces[square.id]
        const center = centers.get(square.id)!
        const isSelected = selected === square.id
        const isTarget = targets.includes(square.id)
        const isLastMove = state.lastMove?.from === square.id || state.lastMove?.to === square.id
        const label = piece ? `${square.id}, ${piece.player} ${piece.type}` : `${square.id}, empty`
        return (
          <g
            className="three-square"
            role="gridcell"
            aria-label={label}
            aria-selected={isSelected}
            tabIndex={0}
            onClick={() => activate(square.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') activate(square.id)
            }}
            key={square.id}
          >
            <polygon
              points={square.points.map((point) => point.join(',')).join(' ')}
              className={`${square.shade} ${isSelected ? 'selected' : ''} ${isLastMove ? 'last-move' : ''}`}
            />
            <text x={center[0] - 22} y={center[1] + 5} className="three-coordinate">
              {square.id}
            </text>
            {piece && (
              <image
                href={`/assets/pieces/${piece.player}_${piece.type}.svg`}
                x={center[0] - 27}
                y={center[1] - 27}
                width="54"
                height="54"
                className="three-piece"
              />
            )}
            {isTarget && (
              <circle
                cx={center[0]}
                cy={center[1]}
                r={piece ? 28 : 10}
                className={piece ? 'three-capture' : 'three-target'}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
