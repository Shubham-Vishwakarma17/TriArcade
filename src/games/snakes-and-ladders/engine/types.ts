export interface RacePlayer {
  id: number
  name: string
  color: string
  position: number
}

export interface RaceTurn {
  playerId: number
  roll: number
  from: number
  landed: number
  to: number
  event: 'move' | 'ladder' | 'snake' | 'overshoot' | 'win'
}

export interface SnakesGameState {
  players: RacePlayer[]
  currentPlayer: number
  lastRoll: number | null
  winnerId: number | null
  turn: RaceTurn | null
  history: RaceTurn[]
}
