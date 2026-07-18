import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { getCheckedKingSquare, getGameStatus, pieceAsset } from './chessEngine'

describe('chess engine helpers', () => {
  it('reports the starting turn', () => {
    expect(getGameStatus(new Chess())).toBe('White to move')
  })

  it("detects checkmate after Fool's Mate", () => {
    const game = new Chess()
    game.move('f3')
    game.move('e5')
    game.move('g4')
    game.move('Qh4#')

    expect(game.isCheckmate()).toBe(true)
    expect(getGameStatus(game)).toBe('White is checkmated')
    expect(getCheckedKingSquare(game)).toBe('e1')
  })

  it('maps typed pieces to the retained artwork', () => {
    expect(pieceAsset('w', 'n')).toBe('/assets/pieces/white_knight.svg')
    expect(pieceAsset('b', 'q')).toBe('/assets/pieces/black_queen.svg')
  })
})
