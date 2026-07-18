import { boardTransitions } from '../engine/gameEngine'
import type { RacePlayer } from '../engine/types'
import type { CSSProperties } from 'react'

interface RaceBoardProps {
  players: RacePlayer[]
}

function numberAt(displayRow: number, displayColumn: number) {
  const rowFromBottom = 9 - displayRow
  return rowFromBottom % 2 === 0
    ? rowFromBottom * 10 + displayColumn + 1
    : rowFromBottom * 10 + (10 - displayColumn)
}

function cellCenter(number: number) {
  const rowFromBottom = Math.floor((number - 1) / 10)
  const offset = (number - 1) % 10
  const column = rowFromBottom % 2 === 0 ? offset : 9 - offset
  return { x: column * 10 + 5, y: (9 - rowFromBottom) * 10 + 5 }
}

export function RaceBoard({ players }: RaceBoardProps) {
  const cells = Array.from({ length: 100 }, (_, index) =>
    numberAt(Math.floor(index / 10), index % 10),
  )
  return (
    <div className="race-board" role="grid" aria-label="Snakes and Ladders board">
      <svg className="race-paths" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="snake-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fb7185" />
            <stop offset="1" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="ladder-gradient" x1="0" y1="1" x2="0" y2="0">
            <stop stopColor="#15803d" />
            <stop offset="1" stopColor="#86efac" />
          </linearGradient>
        </defs>
        {Object.entries(boardTransitions).map(([startValue, end]) => {
          const start = Number(startValue)
          const from = cellCenter(start)
          const to = cellCenter(end)
          const ladder = end > start
          return ladder ? (
            <g className="ladder-line" key={start}>
              <line x1={from.x - 1.5} y1={from.y} x2={to.x - 1.5} y2={to.y} />
              <line x1={from.x + 1.5} y1={from.y} x2={to.x + 1.5} y2={to.y} />
              {[0.18, 0.34, 0.5, 0.66, 0.82].map((progress) => (
                <line
                  className="ladder-rung"
                  x1={from.x + (to.x - from.x) * progress - 1.5}
                  y1={from.y + (to.y - from.y) * progress}
                  x2={from.x + (to.x - from.x) * progress + 1.5}
                  y2={from.y + (to.y - from.y) * progress}
                  key={progress}
                />
              ))}
            </g>
          ) : (
            <g className="snake-group" key={start}>
              <path
                className="snake-shadow"
                d={`M${from.x},${from.y} C${from.x + 10},${from.y + 8} ${to.x - 10},${to.y - 8} ${to.x},${to.y}`}
              />
              <path
                className="snake-line"
                d={`M${from.x},${from.y} C${from.x + 10},${from.y + 8} ${to.x - 10},${to.y - 8} ${to.x},${to.y}`}
              />
              <circle className="snake-head" cx={from.x} cy={from.y} r="2.4" />
              <circle className="snake-eye" cx={from.x - 0.7} cy={from.y - 0.5} r=".35" />
              <circle className="snake-eye" cx={from.x + 0.7} cy={from.y - 0.5} r=".35" />
            </g>
          )
        })}
      </svg>
      {cells.map((number) => (
        <div
          className={`race-cell tone-${(number + Math.floor(number / 10)) % 5}`}
          role="gridcell"
          aria-label={`Square ${number}`}
          key={number}
        >
          <span>{number}</span>
          {boardTransitions[number] && (
            <b className={boardTransitions[number] > number ? 'ladder-mark' : 'snake-mark'}>
              {boardTransitions[number] > number ? '↗' : '↘'}
            </b>
          )}
        </div>
      ))}
      <div className="token-layer" aria-label="Player tokens">
        {players
          .filter((player) => player.position > 0)
          .map((player, index) => {
            const center = cellCenter(player.position)
            const offsets = [
              [-1.8, -1.8],
              [1.8, -1.8],
              [-1.8, 1.8],
              [1.8, 1.8],
            ][index]
            return (
              <span
                className="race-token"
                aria-label={`${player.name} on square ${player.position}`}
                style={
                  {
                    '--token': player.color,
                    left: `${center.x + offsets[0]}%`,
                    top: `${center.y + offsets[1]}%`,
                  } as CSSProperties
                }
                key={player.id}
              >
                {player.id + 1}
              </span>
            )
          })}
      </div>
      <div className="finish-crown" aria-hidden="true">
        ♛
      </div>
    </div>
  )
}
