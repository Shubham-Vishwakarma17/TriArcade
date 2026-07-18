import { describe, expect, it } from 'vitest'
import {
  createWorld,
  escape,
  grabGold,
  moveAgent,
  percepts,
  shoot,
  solutionPath,
} from './gameEngine'
describe('Wumpus World engine', () => {
  it('reveals only local danger percepts', () => {
    const state = moveAgent(
      { ...createWorld(), wumpus: { row: 1, column: 0 }, pits: [{ row: 0, column: 3 }] },
      'up',
    )
    expect(percepts(state).stench).toBe(true)
    expect(percepts(state).breeze).toBe(false)
  })
  it('kills the wumpus when shot in its direction', () => {
    const state = shoot({ ...createWorld(), wumpus: { row: 1, column: 0 } }, 'up')
    expect(state.wumpusAlive).toBe(false)
    expect(state.arrow).toBe(false)
  })
  it('allows escape only after collecting gold', () => {
    let state = createWorld()
    state = { ...state, agent: state.gold }
    state = grabGold(state)
    state = { ...state, agent: { row: 3, column: 0 } }
    expect(escape(state).status).toBe('won')
  })
  it('generates a safe route to gold for every random cave', () => {
    for (let index = 0; index < 30; index += 1)
      expect(solutionPath(createWorld()).length).toBeGreaterThan(1)
  })
})
