export type Queen = { row: number; column: number }

export function attacks(a: Queen, b: Queen) {
  return (
    a.row === b.row ||
    a.column === b.column ||
    Math.abs(a.row - b.row) === Math.abs(a.column - b.column)
  )
}

export function conflicts(queens: Queen[]) {
  const result = new Set<string>()
  queens.forEach((queen, index) => {
    queens.slice(index + 1).forEach((other) => {
      if (attacks(queen, other)) {
        result.add(`${queen.row}:${queen.column}`)
        result.add(`${other.row}:${other.column}`)
      }
    })
  })
  return result
}

export function isSolved(size: number, queens: Queen[]) {
  return queens.length === size && conflicts(queens).size === 0
}

export function solveQueens(size: number): Queen[] {
  const placed: Queen[] = []
  function search(row: number): boolean {
    if (row === size) return true
    for (let column = 0; column < size; column += 1) {
      const queen = { row, column }
      if (!placed.some((item) => attacks(item, queen))) {
        placed.push(queen)
        if (search(row + 1)) return true
        placed.pop()
      }
    }
    return false
  }
  search(0)
  return placed
}
