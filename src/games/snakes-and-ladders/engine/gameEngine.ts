import type { RacePlayer, RaceTurn, SnakesGameState } from './types'

export const boardTransitions: Record<number, number> = {
  4: 25,
  13: 46,
  33: 49,
  42: 63,
  50: 69,
  62: 81,
  74: 92,
  27: 5,
  40: 3,
  43: 18,
  54: 31,
  66: 45,
  76: 58,
  89: 53,
  99: 41,
}

const playerColors = ['#8b5cf6', '#22d3ee', '#fb7185', '#fbbf24']

export function createSnakesGame(names: string[]): SnakesGameState {
  if (names.length < 2 || names.length > 4) throw new Error('Snakes & Ladders needs 2–4 players')
  return {
    players: names.map<RacePlayer>((name, index) => ({
      id: index,
      name: name.trim() || `Player ${index + 1}`,
      color: playerColors[index],
      position: 0,
    })),
    currentPlayer: 0,
    lastRoll: null,
    winnerId: null,
    turn: null,
    history: [],
  }
}

export function playRoll(state: SnakesGameState, roll: number): SnakesGameState {
  if (state.winnerId !== null) return state
  if (!Number.isInteger(roll) || roll < 1 || roll > 6)
    throw new Error('Dice roll must be between 1 and 6')

  const player = state.players[state.currentPlayer]
  const from = player.position
  const landed = from + roll
  const overshoot = landed > 100
  const transition = overshoot ? undefined : boardTransitions[landed]
  const to = overshoot ? from : (transition ?? landed)
  const event: RaceTurn['event'] = overshoot
    ? 'overshoot'
    : to === 100
      ? 'win'
      : transition
        ? to > landed
          ? 'ladder'
          : 'snake'
        : 'move'
  const turn: RaceTurn = {
    playerId: player.id,
    roll,
    from,
    landed: overshoot ? from : landed,
    to,
    event,
  }
  const players = state.players.map((candidate) =>
    candidate.id === player.id ? { ...candidate, position: to } : candidate,
  )
  const winnerId = to === 100 ? player.id : null
  const earnsExtraTurn = roll === 6 && !overshoot && winnerId === null

  return {
    ...state,
    players,
    lastRoll: roll,
    winnerId,
    currentPlayer: earnsExtraTurn
      ? state.currentPlayer
      : (state.currentPlayer + 1) % state.players.length,
    turn,
    history: [...state.history, turn],
  }
}

export function describeTurn(state: SnakesGameState) {
  if (state.winnerId !== null) return `${state.players[state.winnerId].name} wins!`
  if (!state.turn) return `${state.players[state.currentPlayer].name} rolls first`
  const player = state.players[state.turn.playerId]
  const bonus = state.turn.roll === 6 ? ' — roll again!' : ''
  if (state.turn.event === 'ladder')
    return `${player.name} climbed a ladder to ${state.turn.to}${bonus}`
  if (state.turn.event === 'snake') return `${player.name} slid down to ${state.turn.to}${bonus}`
  if (state.turn.event === 'overshoot') return `${player.name} needs an exact roll to finish`
  if (state.turn.roll === 6) return `${player.name} rolled six — roll again!`
  return `${state.players[state.currentPlayer].name}'s turn`
}
