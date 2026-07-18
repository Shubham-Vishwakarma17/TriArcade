import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { allLegalMoves, createThreePlayerGame } from '../engine/gameEngine'
import { ThreePlayerChessPage } from './ThreePlayerChessPage'

afterEach(cleanup)

describe('ThreePlayerChessPage', () => {
  it('renders all three players and opens the rules', () => {
    render(
      <MemoryRouter>
        <ThreePlayerChessPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('White Player')).toBeInTheDocument()
    expect(screen.getByText('Black Player')).toBeInTheDocument()
    expect(screen.getByText('Red Player')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /rules/i }))
    expect(screen.getByRole('dialog', { name: /three-player chess rules/i })).toBeInTheDocument()
  })

  it('plays a legal move and advances from white to black', () => {
    const opening = createThreePlayerGame()
    const move = allLegalMoves(opening, 'white')[0]
    const movingPiece = opening.pieces[move.from]
    render(
      <MemoryRouter>
        <ThreePlayerChessPage />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('gridcell', { name: `${move.from}, white ${movingPiece.type}` }),
    )
    fireEvent.click(screen.getByRole('gridcell', { name: `${move.to}, empty` }))

    expect(screen.getByText(/^Black to move/)).toBeInTheDocument()
    expect(screen.getByText(/1 moves/)).toBeInTheDocument()
  })
})
