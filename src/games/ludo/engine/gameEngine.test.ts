import { describe, expect, it } from 'vitest'
import { createLudoGame, moveLudoToken, rollLudoDice } from './gameEngine'

describe('Ludo engine', () => {
  it('requires a six to release a token from the yard', () => {
    const game = createLudoGame(['A', 'B'])
    expect(rollLudoDice(game, 4).currentPlayer).toBe(1)
    const six = rollLudoDice(game, 6)
    expect(six.movableTokens).toEqual([0, 1, 2, 3])
    expect(moveLudoToken(six, 0).players[0].tokens[0].progress).toBe(0)
  })

  it('forfeits the turn after three consecutive sixes', () => {
    let game = createLudoGame(['A', 'B'])
    game = moveLudoToken(rollLudoDice(game, 6), 0)
    game = moveLudoToken(rollLudoDice(game, 6), 0)
    game = rollLudoDice(game, 6)
    expect(game.currentPlayer).toBe(1)
    expect(game.message).toMatch(/Player 2|B/)
  })

  it('requires an exact roll to enter home', () => {
    const initial = createLudoGame(['A', 'B'])
    const nearHome = {
      ...initial,
      players: initial.players.map((player) =>
        player.id === 0
          ? {
              ...player,
              tokens: player.tokens.map((token) =>
                token.id === 0 ? { ...token, progress: 56 } : token,
              ),
            }
          : player,
      ),
    }
    expect(rollLudoDice(nearHome, 3).movableTokens).not.toContain(0)
    const exact = rollLudoDice(nearHome, 2)
    expect(moveLudoToken(exact, 0).players[0].tokens[0].progress).toBe(58)
  })

  it('captures opponent tokens on unsafe shared squares', () => {
    const initial = createLudoGame(['A', 'B'])
    const setup = {
      ...initial,
      players: [
        {
          ...initial.players[0],
          tokens: initial.players[0].tokens.map((token) =>
            token.id === 0 ? { ...token, progress: 4 } : token,
          ),
        },
        {
          ...initial.players[1],
          tokens: initial.players[1].tokens.map((token) =>
            token.id === 0 ? { ...token, progress: 44 } : token,
          ),
        },
      ],
    }
    const moved = moveLudoToken(rollLudoDice(setup, 1), 0)
    expect(moved.players[1].tokens[0].progress).toBe(-1)
  })
})
