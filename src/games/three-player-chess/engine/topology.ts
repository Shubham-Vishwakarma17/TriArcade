import { boardSquares } from './boardData'
import type { Player, Point } from './types'

export interface LogicalSquare {
  x: number
  y: number
  sector: number
}

export const playerSector: Record<Player, number> = { white: 0, black: 1, red: 2 }
const sectorFiles = [
  ['A', 'B', 'C', 'D', 'I', 'J', 'K', 'L'],
  ['L', 'K', 'J', 'I', 'E', 'F', 'G', 'H'],
  ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
]

export const squareById = new Map(boardSquares.map((square) => [square.id, square]))
export const centers = new Map(
  boardSquares.map((square) => [
    square.id,
    square.points.reduce<Point>(
      (sum, point) => [sum[0] + point[0] / 4, sum[1] + point[1] / 4],
      [0, 0],
    ),
  ]),
)

function squareId(sector: number, x: number, y: number) {
  const rank = sector === 0 ? 8 - y : sector === 1 ? 12 - y : y + 1
  return `${sectorFiles[sector][x]}${rank}`
}

export function logicalKey(square: LogicalSquare) {
  return `${square.sector}:${square.x}:${square.y}`
}

export const logicalById = new Map<string, LogicalSquare>()
export const idByLogical = new Map<string, string>()
for (let sector = 0; sector < 3; sector += 1) {
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const id = squareId(sector, x, y)
      const logical = { x, y, sector }
      logicalById.set(id, logical)
      idByLogical.set(logicalKey(logical), id)
    }
  }
}

export function normalizeLogical(square: LogicalSquare): LogicalSquare | null {
  if (square.x < 0 || square.x > 7 || square.y < 0 || square.y > 7) return null
  if (square.y <= 3) return square
  return square.x > 3
    ? { x: 7 - square.x, y: 7 - square.y, sector: (square.sector + 1) % 3 }
    : { x: 7 - square.x, y: 7 - square.y, sector: (square.sector + 2) % 3 }
}

export function fromPerspective(player: Player, squareIdValue: string): LogicalSquare {
  const square = logicalById.get(squareIdValue)!
  const sector = playerSector[player]
  return square.sector === sector ? square : { x: 7 - square.x, y: 7 - square.y, sector }
}

export function targetFromPerspective(player: Player, originId: string, dx: number, dy: number) {
  const origin = fromPerspective(player, originId)
  const target = normalizeLogical({
    x: origin.x + dx,
    y: origin.y + dy,
    sector: playerSector[player],
  })
  return target ? (idByLogical.get(logicalKey(target)) ?? null) : null
}

export const pawnStarts = new Set(
  boardSquares.filter((square) => square.initialPiece?.type === 'pawn').map((square) => square.id),
)

export const promotionSquares: Record<Player, Set<string>> = {
  white: promotionRank('white'),
  black: promotionRank('black'),
  red: promotionRank('red'),
}

function promotionRank(player: Player) {
  return new Set(
    boardSquares
      .filter(
        (square) =>
          square.initialPiece &&
          square.initialPiece.type !== 'pawn' &&
          square.initialPiece.player !== player,
      )
      .map((square) => square.id),
  )
}
