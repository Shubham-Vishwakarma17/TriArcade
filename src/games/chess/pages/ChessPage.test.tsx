import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ChessPage } from './ChessPage'

describe('ChessPage', () => {
  it('plays a legal local move and changes the turn', () => {
    render(
      <MemoryRouter>
        <ChessPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('gridcell', { name: 'e2, white pawn' }))
    fireEvent.click(screen.getByRole('gridcell', { name: 'e4, empty' }))

    expect(screen.getByText('Black to move')).toBeInTheDocument()
    expect(screen.getByText('e4')).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: 'e4, white pawn' })).toBeInTheDocument()
  })
})
