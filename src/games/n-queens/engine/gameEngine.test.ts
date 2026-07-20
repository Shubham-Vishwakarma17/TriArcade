import { describe, expect, it } from 'vitest'
import { attacks, conflicts, isSolved, solveQueens } from './gameEngine'

describe('N-Queens engine', () => {
  it('detects row and diagonal attacks', () => {
    expect(attacks({ row: 0, column: 0 }, { row: 2, column: 2 })).toBe(true)
    expect(
      conflicts([
        { row: 0, column: 0 },
        { row: 0, column: 3 },
      ]).size,
    ).toBe(2)
  })
  it('creates valid solutions', () => {
    for (const size of [4, 5, 8]) expect(isSolved(size, solveQueens(size))).toBe(true)
  })
})
