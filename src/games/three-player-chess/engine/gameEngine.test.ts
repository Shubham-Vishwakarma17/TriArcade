import { describe, expect, it } from 'vitest'
import {
  allLegalMoves,
  applyThreePlayerMove,
  createThreePlayerGame,
  gameStatus,
  legalTargets,
  pseudoLegalTargets,
} from './gameEngine'
import { boardSquares } from './boardData'
import { idByLogical, logicalById, normalizeLogical } from './topology'
import type { ThreePlayerGameState } from './types'

describe('three-player chess engine', () => {
  it('builds the complete 96-square, 48-piece opening position', () => {
    const game = createThreePlayerGame()
    expect(boardSquares).toHaveLength(96)
    expect(Object.keys(game.pieces)).toHaveLength(48)
    expect(Object.values(game.pieces).filter((piece) => piece.player === 'white')).toHaveLength(16)
  })

  it('maps every visible square to one unique logical coordinate', () => {
    expect(logicalById.size).toBe(96)
    expect(idByLogical.size).toBe(96)
  })

  it('crosses each half of the center into the correct neighboring sector', () => {
    expect(normalizeLogical({ x: 2, y: 4, sector: 0 })).toEqual({ x: 5, y: 3, sector: 2 })
    expect(normalizeLogical({ x: 5, y: 4, sector: 0 })).toEqual({ x: 2, y: 3, sector: 1 })
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

  it('uses standard opening pawn and knight vectors for every army', () => {
    const game = createThreePlayerGame()
    expect(pseudoLegalTargets(game, 'A7').sort()).toEqual(['A5', 'A6'])
    expect(pseudoLegalTargets(game, 'B8').sort()).toEqual(['A6', 'C6'])
    expect(pseudoLegalTargets(game, 'L11').sort()).toEqual(['L10', 'L9'])
    expect(pseudoLegalTargets(game, 'H2').sort()).toEqual(['H3', 'H4'])
  })

  it('continues straight through the two white center seams', () => {
    const game: ThreePlayerGameState = {
      ...createThreePlayerGame(),
      pieces: { A5: { player: 'white' as const, type: 'rook' as const } },
    }
    const left = pseudoLegalTargets(game, 'A5')
    expect(left).toEqual(expect.arrayContaining(['A4', 'A3', 'A2', 'A1']))

    game.pieces = { I5: { player: 'white' as const, type: 'rook' as const } }
    const right = pseudoLegalTargets(game, 'I5')
    expect(right).toEqual(expect.arrayContaining(['I9', 'I10', 'I11', 'I12']))
  })
})
