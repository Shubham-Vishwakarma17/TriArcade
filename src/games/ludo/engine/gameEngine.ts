import { colors, FINISH_PROGRESS, globalTrackIndex, safeTrackIndexes } from './board'
import type { LudoEvent, LudoPlayer, LudoState } from './types'

export function createLudoGame(names: string[]): LudoState {
  if (names.length < 2 || names.length > 4) throw new Error('Ludo needs 2–4 players')
  const players = names.map<LudoPlayer>((name, id) => ({
    id,
    name: name.trim() || `Player ${id + 1}`,
    color: colors[id],
    tokens: Array.from({ length: 4 }, (_, tokenId) => ({ id: tokenId, progress: -1 })),
  }))
  return {
    players,
    currentPlayer: 0,
    phase: 'roll',
    dice: null,
    consecutiveSixes: 0,
    winnerId: null,
    movableTokens: [],
    history: [],
    message: `${players[0].name} rolls first`,
  }
}

export function rollLudoDice(state: LudoState, roll: number): LudoState {
  if (state.phase !== 'roll' || state.winnerId !== null) return state
  if (!Number.isInteger(roll) || roll < 1 || roll > 6)
    throw new Error('Dice roll must be between 1 and 6')
  const player = state.players[state.currentPlayer]
  const consecutiveSixes = roll === 6 ? state.consecutiveSixes + 1 : 0
  if (consecutiveSixes === 3)
    return passTurn(state, {
      playerId: player.id,
      roll,
      message: `${player.name} rolled three sixes and lost the turn`,
    })
  const movableTokens = player.tokens
    .filter(
      (token) =>
        token.progress < FINISH_PROGRESS &&
        (token.progress >= 0 ? token.progress + roll <= FINISH_PROGRESS : roll === 6),
    )
    .map((token) => token.id)
  if (!movableTokens.length)
    return passTurn(
      { ...state, consecutiveSixes },
      { playerId: player.id, roll, message: `${player.name} has no legal move` },
    )
  return {
    ...state,
    phase: 'move',
    dice: roll,
    consecutiveSixes,
    movableTokens,
    message: `${player.name} rolled ${roll}. Choose a token.`,
  }
}

export function moveLudoToken(state: LudoState, tokenId: number): LudoState {
  if (state.phase !== 'move' || state.dice === null || !state.movableTokens.includes(tokenId))
    return state
  const player = state.players[state.currentPlayer]
  const token = player.tokens[tokenId]
  const progress = token.progress < 0 ? 0 : token.progress + state.dice
  let captured = false
  let players = state.players.map((candidate) =>
    candidate.id === player.id
      ? {
          ...candidate,
          tokens: candidate.tokens.map((item) =>
            item.id === tokenId ? { ...item, progress } : item,
          ),
        }
      : candidate,
  )

  if (progress < 52) {
    const landing = globalTrackIndex(player.id, progress)
    if (!safeTrackIndexes.has(landing)) {
      players = players.map((opponent) =>
        opponent.id === player.id
          ? opponent
          : {
              ...opponent,
              tokens: opponent.tokens.map((item) =>
                item.progress >= 0 &&
                item.progress < 52 &&
                globalTrackIndex(opponent.id, item.progress) === landing
                  ? ((captured = true), { ...item, progress: -1 })
                  : item,
              ),
            },
      )
    }
  }

  const finished = progress === FINISH_PROGRESS
  const updatedPlayer = players[player.id]
  const winnerId = updatedPlayer.tokens.every((item) => item.progress === FINISH_PROGRESS)
    ? player.id
    : null
  const bonus = state.dice === 6 || captured || finished
  const event: LudoEvent = {
    playerId: player.id,
    roll: state.dice,
    tokenId,
    message:
      winnerId !== null
        ? `${player.name} wins the game!`
        : captured
          ? `${player.name} captured a token`
          : finished
            ? `${player.name} brought a token home`
            : `${player.name} moved token ${tokenId + 1}`,
  }
  if (winnerId !== null)
    return {
      ...state,
      players,
      phase: 'won',
      winnerId,
      dice: null,
      movableTokens: [],
      history: [...state.history, event],
      message: event.message,
    }
  if (bonus)
    return {
      ...state,
      players,
      phase: 'roll',
      dice: null,
      movableTokens: [],
      history: [...state.history, event],
      message: `${event.message} — roll again!`,
    }
  return advanceTurn({ ...state, players, history: [...state.history, event] })
}

function passTurn(state: LudoState, event: LudoEvent) {
  return advanceTurn({ ...state, history: [...state.history, event] })
}
function advanceTurn(state: LudoState): LudoState {
  const currentPlayer = (state.currentPlayer + 1) % state.players.length
  return {
    ...state,
    currentPlayer,
    phase: 'roll',
    dice: null,
    consecutiveSixes: 0,
    movableTokens: [],
    message: `${state.players[currentPlayer].name}'s turn`,
  }
}
