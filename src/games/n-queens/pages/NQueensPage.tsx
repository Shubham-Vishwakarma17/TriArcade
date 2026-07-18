import { ArrowLeft, Crown, Lightbulb, RotateCcw, Undo2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { conflicts, isSolved, solveQueens, type Queen } from '../engine/gameEngine'

export function NQueensPage() {
  const [size, setSize] = useState(8)
  const [queens, setQueens] = useState<Queen[]>([])
  const [history, setHistory] = useState<Queen[][]>([])
  const [seconds, setSeconds] = useState(0)
  const danger = useMemo(() => conflicts(queens), [queens])
  const solved = isSolved(size, queens)
  useEffect(() => {
    if (solved) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [solved, size])

  function reset(nextSize = size) {
    setSize(nextSize)
    setQueens([])
    setHistory([])
    setSeconds(0)
  }
  function toggle(row: number, column: number) {
    if (solved) return
    setHistory((items) => [...items, queens])
    setQueens((items) => {
      const exists = items.some((queen) => queen.row === row && queen.column === column)
      return exists
        ? items.filter((queen) => queen.row !== row || queen.column !== column)
        : [...items, { row, column }]
    })
  }
  function hint() {
    const solution = solveQueens(size)
    const next = solution.find(
      (cell) => !queens.some((queen) => queen.row === cell.row && queen.column === cell.column),
    )
    if (next) {
      setHistory((items) => [...items, queens])
      setQueens((items) => [...items.filter((queen) => queen.row !== next.row), next])
    }
  }

  return (
    <div className="queens-page">
      <header className="game-header">
        <Link to="/" className="game-back">
          <ArrowLeft size={18} /> TriArcade
        </Link>
        <div className="game-title">
          <span>♛</span>
          <div>
            <strong>N-Queens Challenge</strong>
            <small>Logic puzzle</small>
          </div>
        </div>
        <span className="game-header-score">
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:
          {String(seconds % 60).padStart(2, '0')}
        </span>
      </header>
      <main className="queens-layout">
        <section className="queens-stage">
          <div className="queens-heading">
            <div>
              <p className="eyebrow">Think ahead</p>
              <h1>Place {size} queens.</h1>
            </div>
            <p>No two queens may share a row, column, or diagonal.</p>
          </div>
          <div
            className="queens-board"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            role="grid"
            aria-label={`${size} by ${size} queens board`}
          >
            {Array.from({ length: size * size }, (_, index) => {
              const row = Math.floor(index / size),
                column = index % size
              const queen = queens.some((item) => item.row === row && item.column === column)
              const bad = danger.has(`${row}:${column}`)
              return (
                <button
                  type="button"
                  role="gridcell"
                  aria-label={`Row ${row + 1}, column ${column + 1}${queen ? ', queen' : ''}`}
                  className={`${(row + column) % 2 ? 'dark' : ''} ${queen ? 'has-queen' : ''} ${bad ? 'conflict' : ''}`}
                  onClick={() => toggle(row, column)}
                  key={index}
                >
                  {queen && <Crown />}
                </button>
              )
            })}
          </div>
        </section>
        <aside className="queens-panel">
          <div className={`queens-status ${solved ? 'won' : ''}`}>
            <small>{solved ? 'Puzzle complete' : 'Progress'}</small>
            <strong>{solved ? 'Brilliant!' : `${queens.length} / ${size} queens`}</strong>
            <div>
              <span style={{ width: `${Math.min(100, (queens.length / size) * 100)}%` }} />
            </div>
            {danger.size > 0 && <p>{danger.size} queens are attacking each other.</p>}
          </div>
          <div className="queens-sizes">
            <small>Board size</small>
            {[4, 5, 6, 7, 8, 9, 10].map((value) => (
              <button
                className={value === size ? 'active' : ''}
                type="button"
                onClick={() => reset(value)}
                key={value}
              >
                {value}×{value}
              </button>
            ))}
          </div>
          <div className="queens-tips">
            <h2>Strategy</h2>
            <p>
              Start with one queen per row. Watch the red attack lines and spread queens across
              columns.
            </p>
            <ul>
              <li>Tap a square to place a queen</li>
              <li>Tap a queen to remove it</li>
              <li>Use hints only when you are stuck</li>
            </ul>
          </div>
          <div className="queens-actions">
            <button type="button" onClick={hint}>
              <Lightbulb /> Hint
            </button>
            <button
              type="button"
              disabled={!history.length}
              onClick={() => {
                const previous = history.at(-1)
                if (previous) {
                  setQueens(previous)
                  setHistory((items) => items.slice(0, -1))
                }
              }}
            >
              <Undo2 /> Undo
            </button>
            <button type="button" onClick={() => reset()}>
              <RotateCcw /> Reset
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}
