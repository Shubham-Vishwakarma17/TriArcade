import { describe, expect, it } from 'vitest'
import {
  allLegalMoves,
  applyThreePlayerMove,
  createThreePlayerGame,
  gameStatus,
  legalTargets,
} from './gameEngine'
import { boardSquares } from './boardData'
import { diagonalNeighbors, edgeNeighbors } from './topology'

describe('three-player chess engine', () => {
  it('builds the complete 96-square, 48-piece opening position', () => {
    const game = createThreePlayerGame()
    expect(boardSquares).toHaveLength(96)
    expect(Object.keys(game.pieces)).toHaveLength(48)
    expect(Object.values(game.pieces).filter((piece) => piece.player === 'white')).toHaveLength(16)
  })

  it('creates a connected center topology', () => {
    expect([...edgeNeighbors.values()].every((neighbors) => neighbors.length >= 2)).toBe(true)
    expect([...diagonalNeighbors.values()].every((neighbors) => neighbors.length >= 1)).toBe(true)
  })

  it('starts with white and advances to black after a legal move', () => {
    const game = createThreePlayerGame()
    const move = allLegalMoves(game, 'white')[0]
    expect(move).toBeDefined()
    const next = applyThreePlayerMove(game, move.from, move.to)
    expect(next.turn).toBe('black')
    expect(next.history).toHaveLength(1)
    expect(gameStatus(next)).toMatch(/^Black to move/)
  })

  it('does not allow a player to move an opponent piece', () => {
    const game = createThreePlayerGame()
    const blackSquare = Object.entries(game.pieces).find(
      ([, piece]) => piece.player === 'black',
    )![0]
    expect(legalTargets(game, blackSquare)).toEqual([])
  })
})
