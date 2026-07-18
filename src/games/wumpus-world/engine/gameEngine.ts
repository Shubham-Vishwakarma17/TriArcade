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
const key = ({ row, column }: Point) => `${row}:${column}`
export const adjacent = (a: Point, b: Point) =>
  Math.abs(a.row - b.row) + Math.abs(a.column - b.column) === 1
export function createWorld(): WumpusState {
  return {
    size: 4,
    agent: { row: 3, column: 0 },
    pits: [
      { row: 3, column: 2 },
      { row: 1, column: 2 },
      { row: 0, column: 3 },
    ],
    wumpus: { row: 1, column: 0 },
    gold: { row: 0, column: 1 },
    visited: ['3:0'],
    hasGold: false,
    arrow: true,
    wumpusAlive: true,
    score: 0,
    status: 'playing',
    message: 'Enter the cave and find the hidden gold.',
  }
}
export function percepts(state: WumpusState) {
  return {
    breeze: state.pits.some((pit) => adjacent(state.agent, pit)),
    stench: state.wumpusAlive && adjacent(state.agent, state.wumpus),
    glitter: !state.hasGold && key(state.agent) === key(state.gold),
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
    visited: [...new Set([...state.visited, key(next)])],
    score: state.score - 1,
  }
  if (state.pits.some((p) => key(p) === key(next)))
    return {
      ...common,
      status: 'dead',
      score: state.score - 1001,
      message: 'You fell into a bottomless pit.',
    }
  if (state.wumpusAlive && key(state.wumpus) === key(next))
    return {
      ...common,
      status: 'dead',
      score: state.score - 1001,
      message: 'The Wumpus caught the agent.',
    }
  return { ...common, message: 'The agent moved carefully into a new room.' }
}
export function grabGold(state: WumpusState): WumpusState {
  if (state.status !== 'playing' || key(state.agent) !== key(state.gold) || state.hasGold)
    return state
  return {
    ...state,
    hasGold: true,
    score: state.score + 100,
    message: 'Gold secured! Return to the entrance.',
  }
}
export function escape(state: WumpusState): WumpusState {
  if (state.status !== 'playing' || key(state.agent) !== '3:0') return state
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
    if (key(cursor) === key(state.wumpus)) {
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
