import { describe, expect, it } from 'vitest'
import { createSnakesGame, playRoll } from './gameEngine'

describe('Snakes & Ladders engine', () => {
  it('creates games for two to four named players', () => {
    const game = createSnakesGame(['A', 'B', 'C'])
    expect(game.players).toHaveLength(3)
    expect(game.players.every((player) => player.position === 0)).toBe(true)
  })

  it('climbs ladders and descends snakes', () => {
    let game = createSnakesGame(['A', 'B'])
    game = playRoll(game, 4)
    expect(game.players[0].position).toBe(25)
    game = {
      ...game,
      currentPlayer: 0,
      players: game.players.map((player) =>
        player.id === 0 ? { ...player, position: 21 } : player,
      ),
    }
    game = playRoll(game, 6)
    expect(game.players[0].position).toBe(5)
  })

  it('gives an extra turn for six', () => {
    const game = playRoll(createSnakesGame(['A', 'B']), 6)
    expect(game.currentPlayer).toBe(0)
  })

  it('requires an exact roll to reach 100', () => {
    const initial = createSnakesGame(['A', 'B'])
    const nearFinish = {
      ...initial,
      players: [{ ...initial.players[0], position: 98 }, initial.players[1]],
    }
    const overshoot = playRoll(nearFinish, 4)
    expect(overshoot.players[0].position).toBe(98)
    const winner = playRoll(nearFinish, 2)
    expect(winner.winnerId).toBe(0)
  })

  it('passes the turn when a six overshoots the finish', () => {
    const initial = createSnakesGame(['A', 'B'])
    const nearFinish = {
      ...initial,
      players: [{ ...initial.players[0], position: 97 }, initial.players[1]],
    }
    const next = playRoll(nearFinish, 6)
    expect(next.players[0].position).toBe(97)
    expect(next.currentPlayer).toBe(1)
  })

  it('rejects invalid player counts and dice values', () => {
    expect(() => createSnakesGame(['Solo'])).toThrow(/2–4 players/)
    expect(() => playRoll(createSnakesGame(['A', 'B']), 7)).toThrow(/between 1 and 6/)
  })
})
