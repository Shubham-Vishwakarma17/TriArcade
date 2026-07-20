import type { LudoColor } from './types'

export type GridPoint = [row: number, column: number]

export const sharedTrack: GridPoint[] = [
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [6, 5],
  [5, 6],
  [4, 6],
  [3, 6],
  [2, 6],
  [1, 6],
  [0, 6],
  [0, 7],
  [0, 8],
  [1, 8],
  [2, 8],
  [3, 8],
  [4, 8],
  [5, 8],
  [6, 9],
  [6, 10],
  [6, 11],
  [6, 12],
  [6, 13],
  [6, 14],
  [7, 14],
  [8, 14],
  [8, 13],
  [8, 12],
  [8, 11],
  [8, 10],
  [8, 9],
  [9, 8],
  [10, 8],
  [11, 8],
  [12, 8],
  [13, 8],
  [14, 8],
  [14, 7],
  [14, 6],
  [13, 6],
  [12, 6],
  [11, 6],
  [10, 6],
  [9, 6],
  [8, 5],
  [8, 4],
  [8, 3],
  [8, 2],
  [8, 1],
  [8, 0],
  [7, 0],
  [6, 0],
]

export const colors: LudoColor[] = ['red', 'green', 'yellow', 'blue']
export const startOffsets = [0, 13, 26, 39]
export const safeTrackIndexes = new Set([0, 8, 13, 21, 26, 34, 39, 47])
export const FINISH_PROGRESS = 58

export const homePaths: Record<LudoColor, GridPoint[]> = {
  red: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
    [7, 6],
    [7, 7],
  ],
  green: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
    [7, 7],
  ],
  yellow: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9],
    [7, 8],
    [7, 7],
  ],
  blue: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7],
    [8, 7],
    [7, 7],
  ],
}

export const yardPoints: Record<LudoColor, GridPoint[]> = {
  red: [
    [2, 2],
    [2, 4],
    [4, 2],
    [4, 4],
  ],
  green: [
    [2, 10],
    [2, 12],
    [4, 10],
    [4, 12],
  ],
  yellow: [
    [10, 10],
    [10, 12],
    [12, 10],
    [12, 12],
  ],
  blue: [
    [10, 2],
    [10, 4],
    [12, 2],
    [12, 4],
  ],
}

export function globalTrackIndex(playerId: number, progress: number) {
  return (startOffsets[playerId] + progress) % sharedTrack.length
}

export function tokenPoint(playerId: number, progress: number, tokenId: number): GridPoint {
  const color = colors[playerId]
  if (progress < 0) return yardPoints[color][tokenId]
  if (progress < 52) return sharedTrack[globalTrackIndex(playerId, progress)]
  return homePaths[color][progress - 52]
}
