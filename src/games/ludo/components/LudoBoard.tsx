import type { CSSProperties } from 'react'
import { homePaths, safeTrackIndexes, sharedTrack, tokenPoint } from '../engine/board'
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
  return (
    <div className="ludo-board" role="grid" aria-label="Ludo board">
      {Array.from({ length: 225 }, (_, index) => {
        const row = Math.floor(index / 15)
        const column = index % 15
        const key = `${row}:${column}`
        const trackIndex = pathKeys.get(key)
        const homeColor = homeKeys.get(key)
        const base = baseColor(row, column)
        const center = row >= 6 && row <= 8 && column >= 6 && column <= 8
        return (
          <div
            className={`ludo-cell ${trackIndex !== undefined ? 'track' : ''} ${homeColor ? `home ${homeColor}` : ''} ${base ? `base ${base}` : ''} ${center ? 'center' : ''} ${trackIndex !== undefined && safeTrackIndexes.has(trackIndex) ? 'safe' : ''}`}
            role="gridcell"
            aria-label={`Board row ${row + 1}, column ${column + 1}`}
            key={key}
          >
            {trackIndex !== undefined && safeTrackIndexes.has(trackIndex) && <span>★</span>}
          </div>
        )
      })}
      <div className="ludo-center" aria-hidden="true">
        <i className="red" />
        <i className="green" />
        <i className="yellow" />
        <i className="blue" />
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
            const offsets = [
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
                    '--row': row,
                    '--column': column,
                    '--ox': `${offsets[0]}%`,
                    '--oy': `${offsets[1]}%`,
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
      <div className="base-label red">RED</div>
      <div className="base-label green">GREEN</div>
      <div className="base-label yellow">YELLOW</div>
      <div className="base-label blue">BLUE</div>
    </div>
  )
}
