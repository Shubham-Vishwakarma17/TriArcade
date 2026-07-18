import type { CSSProperties } from 'react'
import {
  colors,
  homePaths,
  safeTrackIndexes,
  sharedTrack,
  startOffsets,
  tokenPoint,
} from '../engine/board'
import type { LudoState } from '../engine/types'

interface LudoBoardProps {
  state: LudoState
  onToken: (tokenId: number) => void
}

const pathKeys = new Map(sharedTrack.map((point, index) => [point.join(':'), index]))
const homeKeys = new Map(
  Object.entries(homePaths).flatMap(([color, points]) =>
    points.map((point) => [point.join(':'), color]),
  ),
)

function baseColor(row: number, column: number) {
  if (row < 6 && column < 6) return 'red'
  if (row < 6 && column > 8) return 'green'
  if (row > 8 && column > 8) return 'yellow'
  if (row > 8 && column < 6) return 'blue'
  return null
}

export function LudoBoard({ state, onToken }: LudoBoardProps) {
  const activeColor = state.players[state.currentPlayer].color
  return (
    <div className={`ludo-board active-${activeColor}`} role="grid" aria-label="Ludo board">
      {Array.from({ length: 225 }, (_, index) => {
        const row = Math.floor(index / 15)
        const column = index % 15
        const key = `${row}:${column}`
        const trackIndex = pathKeys.get(key)
        const homeColor = homeKeys.get(key)
        const base = baseColor(row, column)
        const center = row >= 6 && row <= 8 && column >= 6 && column <= 8
        const startPlayer = trackIndex === undefined ? -1 : startOffsets.indexOf(trackIndex)
        return (
          <div
            className={`ludo-cell ${trackIndex !== undefined ? 'track' : ''} ${homeColor ? `home ${homeColor}` : ''} ${base ? `base ${base}` : ''} ${center ? 'center' : ''} ${trackIndex !== undefined && safeTrackIndexes.has(trackIndex) ? 'safe' : ''} ${startPlayer >= 0 ? `player-start ${colors[startPlayer]}` : ''}`}
            role="gridcell"
            aria-label={`Board row ${row + 1}, column ${column + 1}`}
            key={key}
          >
            {trackIndex !== undefined && safeTrackIndexes.has(trackIndex) && <span>★</span>}
          </div>
        )
      })}
      {colors.map((color) => (
        <div className={`ludo-yard ${color}`} aria-hidden="true" key={color}>
          <div>
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      ))}
      <div className="ludo-center" aria-hidden="true">
        <i className="red" />
        <i className="green" />
        <i className="yellow" />
        <i className="blue" />
        <span>★</span>
      </div>
      <div className="ludo-token-layer">
        {state.players.flatMap((player) =>
          player.tokens.map((token) => {
            const [row, column] = tokenPoint(player.id, token.progress, token.id)
            const samePoint = state.players
              .flatMap((candidate) =>
                candidate.tokens.map((item) => ({
                  candidate,
                  item,
                  point: tokenPoint(candidate.id, item.progress, item.id),
                })),
              )
              .filter(({ point }) => point[0] === row && point[1] === column)
            const stackIndex = samePoint.findIndex(
              ({ candidate, item }) => candidate.id === player.id && item.id === token.id,
            )
            const offsets =
              samePoint.length === 1
                ? [0, 0]
                : [
                    [-1.5, -1.5],
                    [1.5, -1.5],
                    [-1.5, 1.5],
                    [1.5, 1.5],
                  ][stackIndex % 4]
            const movable =
              state.currentPlayer === player.id && state.movableTokens.includes(token.id)
            return (
              <button
                className={`ludo-token ${player.color} ${movable ? 'movable' : ''} ${token.progress === 58 ? 'finished' : ''}`}
                type="button"
                aria-label={`${player.name} token ${token.id + 1}${movable ? ', movable' : ''}`}
                disabled={!movable}
                onClick={() => onToken(token.id)}
                style={
                  {
                    left: `${((column + 0.5) / 15) * 100 + offsets[0]}%`,
                    top: `${((row + 0.5) / 15) * 100 + offsets[1]}%`,
                  } as CSSProperties
                }
                key={`${player.id}-${token.id}`}
              >
                <span>{token.id + 1}</span>
              </button>
            )
          }),
        )}
      </div>
      <div className="base-label red">RED HOME</div>
      <div className="base-label green">GREEN HOME</div>
      <div className="base-label yellow">YELLOW HOME</div>
      <div className="base-label blue">BLUE HOME</div>
    </div>
  )
}
