export type Point = { row: number; column: number }
export type Direction = 'up' | 'right' | 'down' | 'left'
export type WumpusStatus = 'playing' | 'won' | 'dead'
export interface WumpusState {
  size: number
  agent: Point
  pits: Point[]
  wumpus: Point
  gold: Point
  visited: string[]
  hasGold: boolean
  arrow: boolean
  wumpusAlive: boolean
  score: number
  status: WumpusStatus
  message: string
}
export const pointKey = ({ row, column }: Point) => `${row}:${column}`
export const adjacent = (a: Point, b: Point) =>
  Math.abs(a.row - b.row) + Math.abs(a.column - b.column) === 1
function shuffled<T>(items: T[], random: () => number) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}
export function solutionPath(state: Pick<WumpusState, 'size' | 'pits' | 'wumpus' | 'gold'>) {
  const start = { row: state.size - 1, column: 0 }
  const blocked = new Set([...state.pits, state.wumpus].map(pointKey))
  const queue: Point[][] = [[start]]
  const seen = new Set([pointKey(start)])
  while (queue.length) {
    const path = queue.shift()!
    const current = path.at(-1)!
    if (pointKey(current) === pointKey(state.gold)) return path
    for (const offset of Object.values(delta)) {
      const next = { row: current.row + offset.row, column: current.column + offset.column }
      const nextKey = pointKey(next)
      if (
        next.row >= 0 &&
        next.column >= 0 &&
        next.row < state.size &&
        next.column < state.size &&
        !blocked.has(nextKey) &&
        !seen.has(nextKey)
      ) {
        seen.add(nextKey)
        queue.push([...path, next])
      }
    }
  }
  return []
}
export function createWorld(random: () => number = Math.random): WumpusState {
  const size = 4
  const start = { row: size - 1, column: 0 }
  const rooms = Array.from({ length: size * size }, (_, index) => ({
    row: Math.floor(index / size),
    column: index % size,
  })).filter((room) => pointKey(room) !== pointKey(start) && !adjacent(room, start))
  let state: WumpusState
  do {
    const layout = shuffled(rooms, random)
    state = {
      size,
      agent: start,
      wumpus: layout[0],
      pits: layout.slice(1, 4),
      gold: layout[4],
      visited: [pointKey(start)],
      hasGold: false,
      arrow: true,
      wumpusAlive: true,
      score: 0,
      status: 'playing',
      message: 'A new cave has formed. Find the hidden gold.',
    }
  } while (!solutionPath(state).length)
  return state
}
export function percepts(state: WumpusState) {
  const goldHere = !state.hasGold && pointKey(state.agent) === pointKey(state.gold)
  return {
    breeze: state.pits.some((pit) => adjacent(state.agent, pit)),
    stench: state.wumpusAlive && adjacent(state.agent, state.wumpus),
    glitter: !state.hasGold && (goldHere || adjacent(state.agent, state.gold)),
    goldHere,
  }
}
const delta: Record<Direction, Point> = {
  up: { row: -1, column: 0 },
  right: { row: 0, column: 1 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
}
export function moveAgent(state: WumpusState, direction: Direction): WumpusState {
  if (state.status !== 'playing') return state
  const d = delta[direction],
    next = { row: state.agent.row + d.row, column: state.agent.column + d.column }
  if (next.row < 0 || next.column < 0 || next.row >= state.size || next.column >= state.size)
    return { ...state, score: state.score - 1, message: 'Bump! A cave wall blocks the way.' }
  const common = {
    ...state,
    agent: next,
    visited: [...new Set([...state.visited, pointKey(next)])],
    score: state.score - 1,
  }
  if (state.pits.some((p) => pointKey(p) === pointKey(next)))
    return {
      ...common,
      status: 'dead',
      score: state.score - 1001,
      message: 'You fell into a bottomless pit.',
    }
  if (state.wumpusAlive && pointKey(state.wumpus) === pointKey(next))
    return {
      ...common,
      status: 'dead',
      score: state.score - 1001,
      message: 'The Wumpus caught the agent.',
    }
  return { ...common, message: 'The agent moved carefully into a new room.' }
}
export function grabGold(state: WumpusState): WumpusState {
  if (state.status !== 'playing' || pointKey(state.agent) !== pointKey(state.gold) || state.hasGold)
    return state
  return {
    ...state,
    hasGold: true,
    score: state.score + 100,
    message: 'Gold secured! Return to the entrance.',
  }
}
export function escape(state: WumpusState): WumpusState {
  if (state.status !== 'playing' || pointKey(state.agent) !== '3:0') return state
  if (!state.hasGold) return { ...state, message: 'Find the gold before leaving the cave.' }
  return {
    ...state,
    status: 'won',
    score: state.score + 1000,
    message: 'Mission complete. The agent escaped with the gold!',
  }
}
export function shoot(state: WumpusState, direction: Direction): WumpusState {
  if (state.status !== 'playing' || !state.arrow) return state
  const d = delta[direction]
  let cursor = { ...state.agent },
    hit = false
  while (true) {
    cursor = { row: cursor.row + d.row, column: cursor.column + d.column }
    if (
      cursor.row < 0 ||
      cursor.column < 0 ||
      cursor.row >= state.size ||
      cursor.column >= state.size
    )
      break
    if (pointKey(cursor) === pointKey(state.wumpus)) {
      hit = true
      break
    }
  }
  return {
    ...state,
    arrow: false,
    wumpusAlive: hit ? false : state.wumpusAlive,
    score: state.score - (hit ? 10 : 20),
    message: hit
      ? 'A terrible scream echoes—the Wumpus is defeated!'
      : 'The arrow disappears into the darkness.',
  }
}
