import { boardSquares } from './boardData'
import type { Player, Point } from './types'

const CENTER: Point = [480, 415.6922]
const EPSILON = 0.08

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

function samePoint(left: Point, right: Point) {
  return Math.abs(left[0] - right[0]) < EPSILON && Math.abs(left[1] - right[1]) < EPSILON
}

function sharedPointCount(leftId: string, rightId: string) {
  const left = squareById.get(leftId)!
  const right = squareById.get(rightId)!
  return left.points.filter((point) =>
    right.points.some((candidate) => samePoint(point, candidate)),
  ).length
}

function distance(left: Point, right: Point) {
  return Math.hypot(left[0] - right[0], left[1] - right[1])
}

export const edgeNeighbors = new Map<string, string[]>()
export const diagonalNeighbors = new Map<string, string[]>()

for (const square of boardSquares) {
  edgeNeighbors.set(square.id, [])
  diagonalNeighbors.set(square.id, [])
}

for (let leftIndex = 0; leftIndex < boardSquares.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < boardSquares.length; rightIndex += 1) {
    const left = boardSquares[leftIndex]
    const right = boardSquares[rightIndex]
    const shared = sharedPointCount(left.id, right.id)
    if (shared >= 2) {
      edgeNeighbors.get(left.id)!.push(right.id)
      edgeNeighbors.get(right.id)!.push(left.id)
    } else if (
      shared === 1 &&
      left.shade === right.shade &&
      distance(centers.get(left.id)!, centers.get(right.id)!) < 175
    ) {
      diagonalNeighbors.get(left.id)!.push(right.id)
      diagonalNeighbors.get(right.id)!.push(left.id)
    }
  }
}

const homeBackRanks: Record<Player, string[]> = { white: [], black: [], red: [] }
const homePawnRanks: Record<Player, string[]> = { white: [], black: [], red: [] }
for (const square of boardSquares) {
  if (!square.initialPiece) continue
  const target = square.initialPiece.type === 'pawn' ? homePawnRanks : homeBackRanks
  target[square.initialPiece.player].push(square.id)
}

function distancesFrom(starts: string[]) {
  const result = new Map<string, number>(starts.map((id) => [id, 0]))
  const queue = [...starts]
  while (queue.length) {
    const current = queue.shift()!
    for (const neighbor of edgeNeighbors.get(current) ?? []) {
      if (result.has(neighbor)) continue
      result.set(neighbor, result.get(current)! + 1)
      queue.push(neighbor)
    }
  }
  return result
}

export const homeDistances: Record<Player, Map<string, number>> = {
  white: distancesFrom(homeBackRanks.white),
  black: distancesFrom(homeBackRanks.black),
  red: distancesFrom(homeBackRanks.red),
}

export const pawnStarts = new Set(Object.values(homePawnRanks).flat())
export const promotionSquares: Record<Player, Set<string>> = {
  white: new Set([...homeBackRanks.black, ...homeBackRanks.red]),
  black: new Set([...homeBackRanks.white, ...homeBackRanks.red]),
  red: new Set([...homeBackRanks.white, ...homeBackRanks.black]),
}

function normalizedDirection(from: string, to: string): Point {
  const start = centers.get(from)!
  const end = centers.get(to)!
  const length = distance(start, end)
  return [(end[0] - start[0]) / length, (end[1] - start[1]) / length]
}

export function traceLines(start: string, neighborMap: Map<string, string[]>) {
  const lines: string[][] = []
  for (const first of neighborMap.get(start) ?? []) {
    const walk = (previous: string, current: string, line: string[], visited: Set<string>) => {
      const incoming = normalizedDirection(previous, current)
      const candidates = (neighborMap.get(current) ?? []).filter((candidate) => {
        if (visited.has(candidate) || candidate === previous) return false
        const outgoing = normalizedDirection(current, candidate)
        return incoming[0] * outgoing[0] + incoming[1] * outgoing[1] > 0.32
      })
      if (!candidates.length) lines.push(line)
      for (const candidate of candidates)
        walk(current, candidate, [...line, candidate], new Set([...visited, candidate]))
    }
    walk(start, first, [first], new Set([start, first]))
  }
  return lines
}

export function centerDistance(squareId: string) {
  return distance(centers.get(squareId)!, CENTER)
}
