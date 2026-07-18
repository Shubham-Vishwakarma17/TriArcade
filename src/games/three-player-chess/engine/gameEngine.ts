import { boardSquares } from './boardData'
import {
  diagonalNeighbors,
  edgeNeighbors,
  homeDistances,
  pawnStarts,
  promotionSquares,
  traceLines,
} from './topology'
import type { Piece, Player, ThreePlayerGameState, ThreePlayerMove } from './types'

export const turnOrder: Player[] = ['white', 'black', 'red']

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

function slidingTargets(state: ThreePlayerGameState, from: string, maps: Map<string, string[]>[]) {
  const piece = state.pieces[from]
  const targets = new Set<string>()
  for (const map of maps) {
    for (const line of traceLines(from, map)) {
      for (const square of line) {
        const occupant = state.pieces[square]
        if (!occupant) targets.add(square)
        else {
          if (occupant.player !== piece.player) targets.add(square)
          break
        }
      }
    }
  }
  return [...targets]
}

function knightTargets(state: ThreePlayerGameState, from: string) {
  const piece = state.pieces[from]
  const one = new Set(edgeNeighbors.get(from) ?? [])
  const two = new Set([...one].flatMap((square) => edgeNeighbors.get(square) ?? []))
  const three = new Set([...two].flatMap((square) => edgeNeighbors.get(square) ?? []))
  const rookTargets = new Set(slidingTargets(state, from, [edgeNeighbors]))
  return [...three].filter(
    (square) =>
      square !== from &&
      !one.has(square) &&
      !two.has(square) &&
      !rookTargets.has(square) &&
      state.pieces[square]?.player !== piece.player,
  )
}

function pawnTargets(state: ThreePlayerGameState, from: string, attacksOnly: boolean) {
  const piece = state.pieces[from]
  const distance = homeDistances[piece.player].get(from) ?? 0
  const forward = (edgeNeighbors.get(from) ?? []).filter(
    (square) => (homeDistances[piece.player].get(square) ?? 0) > distance,
  )
  const captures = (diagonalNeighbors.get(from) ?? []).filter((square) => {
    const occupant = state.pieces[square]
    return (
      (homeDistances[piece.player].get(square) ?? 0) > distance &&
      (attacksOnly || (occupant && occupant.player !== piece.player))
    )
  })
  if (attacksOnly) return captures
  const moves = forward.filter((square) => !state.pieces[square])
  if (pawnStarts.has(from)) {
    for (const first of moves) {
      const firstDistance = homeDistances[piece.player].get(first) ?? 0
      for (const second of edgeNeighbors.get(first) ?? []) {
        if ((homeDistances[piece.player].get(second) ?? 0) > firstDistance && !state.pieces[second])
          moves.push(second)
      }
    }
  }
  return [...new Set([...moves, ...captures])]
}

export function pseudoLegalTargets(state: ThreePlayerGameState, from: string, attacksOnly = false) {
  const piece = state.pieces[from]
  if (!piece) return []
  if (piece.type === 'pawn') return pawnTargets(state, from, attacksOnly)
  if (piece.type === 'rook') return slidingTargets(state, from, [edgeNeighbors])
  if (piece.type === 'bishop') return slidingTargets(state, from, [diagonalNeighbors])
  if (piece.type === 'queen') return slidingTargets(state, from, [edgeNeighbors, diagonalNeighbors])
  if (piece.type === 'knight') return knightTargets(state, from)
  return [
    ...new Set([...(edgeNeighbors.get(from) ?? []), ...(diagonalNeighbors.get(from) ?? [])]),
  ].filter((square) => state.pieces[square]?.player !== piece.player)
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
