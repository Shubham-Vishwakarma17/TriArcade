import { useRef } from 'react'

export type GameSound = 'move' | 'capture' | 'check' | 'game-over' | 'undo' | 'restart'

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext }

const patterns: Record<GameSound, Array<[frequency: number, duration: number, delay?: number]>> = {
  move: [[430, 0.055]],
  capture: [
    [190, 0.09],
    [135, 0.08, 0.045],
  ],
  check: [
    [620, 0.07],
    [820, 0.09, 0.07],
  ],
  'game-over': [
    [520, 0.12],
    [660, 0.12, 0.12],
    [780, 0.24, 0.24],
  ],
  undo: [
    [350, 0.06],
    [280, 0.07, 0.05],
  ],
  restart: [
    [260, 0.08],
    [390, 0.1, 0.07],
  ],
}

export function useGameSounds(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null)

  return (sound: GameSound) => {
    if (!enabled || typeof window === 'undefined') return
    const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
    if (!AudioContextClass) return

    const context = contextRef.current ?? new AudioContextClass()
    contextRef.current = context
    const start = context.currentTime

    for (const [frequency, duration, delay = 0] of patterns[sound]) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const toneStart = start + delay
      oscillator.type = sound === 'capture' ? 'square' : 'sine'
      oscillator.frequency.setValueAtTime(frequency, toneStart)
      gain.gain.setValueAtTime(0.0001, toneStart)
      gain.gain.exponentialRampToValueAtTime(0.13, toneStart + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, toneStart + duration)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(toneStart)
      oscillator.stop(toneStart + duration + 0.015)
    }
  }
}
