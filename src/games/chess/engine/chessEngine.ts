import type { Chess, Color, PieceSymbol, Square } from 'chess.js'

export const pieceNames: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

export function pieceAsset(color: Color, type: PieceSymbol) {
  const colorName = color === 'w' ? 'white' : 'black'
  return `/assets/pieces/${colorName}_${pieceNames[type]}.svg`
}

export function getGameStatus(game: Chess) {
  const player = game.turn() === 'w' ? 'White' : 'Black'

  if (game.isCheckmate()) return `${player} is checkmated`
  if (game.isStalemate()) return 'Draw by stalemate'
  if (game.isInsufficientMaterial()) return 'Draw by insufficient material'
  if (game.isThreefoldRepetition()) return 'Draw by repetition'
  if (game.isDrawByFiftyMoves()) return 'Draw by fifty-move rule'
  if (game.isCheck()) return `${player} is in check`
  return `${player} to move`
}

export function getCheckedKingSquare(game: Chess): Square | null {
  if (!game.isCheck()) return null
  for (const row of game.board()) {
    for (const piece of row) {
      if (piece?.type === 'k' && piece.color === game.turn()) return piece.square
    }
  }
  return null
}
