import { boardSquares } from './boardData'
import { fromPerspective, pawnStarts, promotionSquares, targetFromPerspective } from './topology'
import type { Piece, Player, ThreePlayerGameState, ThreePlayerMove } from './types'

export const turnOrder: Player[] = ['white', 'black', 'red']
const rookDirections = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]
const bishopDirections = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
]
const knightDirections = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [-1, 2],
  [1, -2],
  [-1, -2],
]

export function createThreePlayerGame(): ThreePlayerGameState {
  return {
    pieces: Object.fromEntries(
      boardSquares
        .filter((square) => square.initialPiece)
        .map((square) => [square.id, { ...square.initialPiece! }]),
    ),
    turn: 'white',
    eliminated: [],
    winner: null,
    history: [],
    lastMove: null,
  }
}

function slidingTargets(state: ThreePlayerGameState, from: string, directions: number[][]) {
  const piece = state.pieces[from]
  const targets = new Set<string>()
  for (const [dx, dy] of directions) {
    const visited = new Set<string>()
    for (let distance = 1; distance < 9; distance += 1) {
      const square = targetFromPerspective(piece.player, from, dx * distance, dy * distance)
      if (!square || visited.has(square)) break
      visited.add(square)
      const occupant = state.pieces[square]
      if (!occupant) targets.add(square)
      else {
        if (occupant.player !== piece.player) targets.add(square)
        break
      }
    }
  }
  return [...targets]
}

function jumpTargets(state: ThreePlayerGameState, from: string, directions: number[][]) {
  const piece = state.pieces[from]
  return [
    ...new Set(
      directions
        .map(([dx, dy]) => targetFromPerspective(piece.player, from, dx, dy))
        .filter(Boolean) as string[],
    ),
  ].filter((square) => state.pieces[square]?.player !== piece.player)
}

function pawnTargets(state: ThreePlayerGameState, from: string, attacksOnly: boolean) {
  const piece = state.pieces[from]
  const captures = [-1, 1]
    .map((dx) => targetFromPerspective(piece.player, from, dx, 1))
    .filter(Boolean) as string[]
  const view = fromPerspective(piece.player, from)
  // The two central pawn files gain a third diagonal capture across the opposite seam.
  if (view.y === 3 && view.x === 3) {
    const extra = targetFromPerspective(piece.player, from, 2, 1)
    if (extra) captures.push(extra)
  } else if (view.y === 3 && view.x === 4) {
    const extra = targetFromPerspective(piece.player, from, -2, 1)
    if (extra) captures.push(extra)
  }
  if (attacksOnly) return [...new Set(captures)]
  const moves: string[] = []
  const one = targetFromPerspective(piece.player, from, 0, 1)
  if (one && !state.pieces[one]) {
    moves.push(one)
    const two = targetFromPerspective(piece.player, from, 0, 2)
    if (pawnStarts.has(from) && two && !state.pieces[two]) moves.push(two)
  }
  for (const square of captures) {
    const occupant = state.pieces[square]
    if (occupant && occupant.player !== piece.player) moves.push(square)
  }
  return [...new Set(moves)]
}

export function pseudoLegalTargets(state: ThreePlayerGameState, from: string, attacksOnly = false) {
  const piece = state.pieces[from]
  if (!piece) return []
  if (piece.type === 'pawn') return pawnTargets(state, from, attacksOnly)
  if (piece.type === 'rook') return slidingTargets(state, from, rookDirections)
  if (piece.type === 'bishop') return slidingTargets(state, from, bishopDirections)
  if (piece.type === 'queen')
    return slidingTargets(state, from, [...rookDirections, ...bishopDirections])
  if (piece.type === 'knight') return jumpTargets(state, from, knightDirections)
  return jumpTargets(state, from, [...rookDirections, ...bishopDirections])
}

export function isInCheck(state: ThreePlayerGameState, player: Player) {
  const kingSquare = Object.entries(state.pieces).find(
    ([, piece]) => piece.player === player && piece.type === 'king',
  )?.[0]
  if (!kingSquare) return true
  return Object.entries(state.pieces).some(
    ([square, piece]) =>
      piece.player !== player &&
      !state.eliminated.includes(piece.player) &&
      pseudoLegalTargets(state, square, true).includes(kingSquare),
  )
}

function simulatedState(state: ThreePlayerGameState, from: string, to: string) {
  const pieces = { ...state.pieces, [to]: state.pieces[from] }
  delete pieces[from]
  return { ...state, pieces }
}

export function legalTargets(state: ThreePlayerGameState, from: string) {
  const piece = state.pieces[from]
  if (!piece || piece.player !== state.turn || state.winner) return []
  return pseudoLegalTargets(state, from).filter(
    (to) => !isInCheck(simulatedState(state, from, to), piece.player),
  )
}

export function allLegalMoves(state: ThreePlayerGameState, player: Player) {
  const playerState = { ...state, turn: player }
  return Object.entries(state.pieces).flatMap(([from, piece]) =>
    piece.player === player ? legalTargets(playerState, from).map((to) => ({ from, to })) : [],
  )
}

function nextActivePlayer(player: Player, eliminated: Player[]) {
  let index = turnOrder.indexOf(player)
  do index = (index + 1) % turnOrder.length
  while (eliminated.includes(turnOrder[index]))
  return turnOrder[index]
}

export function applyThreePlayerMove(
  state: ThreePlayerGameState,
  from: string,
  to: string,
): ThreePlayerGameState {
  if (!legalTargets(state, from).includes(to)) return state
  const piece = state.pieces[from]
  const captured = state.pieces[to]
  const movedPiece: Piece =
    promotionSquares[piece.player].has(to) && piece.type === 'pawn'
      ? { ...piece, type: 'queen' }
      : piece
  const pieces = { ...state.pieces, [to]: movedPiece }
  delete pieces[from]
  let eliminated = [...state.eliminated]
  if (captured?.type === 'king') eliminated.push(captured.player)
  const move: ThreePlayerMove = {
    from,
    to,
    piece,
    captured,
    promotion: movedPiece.type !== piece.type ? movedPiece.type : undefined,
    notation: `${piece.type[0].toUpperCase()}${from}${captured ? '×' : '–'}${to}${movedPiece.type !== piece.type ? '=Q' : ''}`,
  }
  let result: ThreePlayerGameState = {
    ...state,
    pieces,
    eliminated,
    history: [...state.history, move],
    lastMove: move,
  }
  const active = turnOrder.filter((player) => !eliminated.includes(player))
  if (active.length === 1) return { ...result, winner: active[0], turn: active[0] }
  let next = nextActivePlayer(state.turn, eliminated)
  for (let attempts = 0; attempts < 3 && !allLegalMoves(result, next).length; attempts += 1) {
    if (isInCheck(result, next)) eliminated = [...eliminated, next]
    next = nextActivePlayer(next, eliminated)
  }
  result = { ...result, eliminated, turn: next }
  const survivors = turnOrder.filter((player) => !eliminated.includes(player))
  return survivors.length === 1 ? { ...result, winner: survivors[0], turn: survivors[0] } : result
}

export function gameStatus(state: ThreePlayerGameState) {
  if (state.winner) return `${capitalize(state.winner)} wins the game`
  return `${capitalize(state.turn)} to move${isInCheck(state, state.turn) ? ' — check' : ''}`
}
export function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1)
}
