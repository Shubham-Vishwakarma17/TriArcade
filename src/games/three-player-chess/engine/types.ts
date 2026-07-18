export type Player = 'white' | 'black' | 'red'
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
export type Point = [number, number]

export interface Piece {
  player: Player
  type: PieceType
}

export interface BoardSquare {
  id: string
  points: Point[]
  shade: 'light' | 'dark'
  initialPiece?: Piece
}

export interface ThreePlayerMove {
  from: string
  to: string
  piece: Piece
  captured?: Piece
  promotion?: PieceType
  notation: string
}

export interface ThreePlayerGameState {
  pieces: Record<string, Piece>
  turn: Player
  eliminated: Player[]
  winner: Player | null
  history: ThreePlayerMove[]
  lastMove: ThreePlayerMove | null
}
