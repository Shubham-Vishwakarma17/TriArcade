export type LudoColor = 'red' | 'green' | 'yellow' | 'blue'
export type LudoPhase = 'roll' | 'move' | 'won'

export interface LudoToken {
  id: number
  progress: number
}
export interface LudoPlayer {
  id: number
  name: string
  color: LudoColor
  tokens: LudoToken[]
}
export interface LudoEvent {
  playerId: number
  roll: number
  tokenId?: number
  message: string
}
export interface LudoState {
  players: LudoPlayer[]
  currentPlayer: number
  phase: LudoPhase
  dice: number | null
  consecutiveSixes: number
  winnerId: number | null
  movableTokens: number[]
  history: LudoEvent[]
  message: string
}
