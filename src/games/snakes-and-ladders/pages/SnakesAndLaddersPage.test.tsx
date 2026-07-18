import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SnakesAndLaddersPage } from './SnakesAndLaddersPage'

describe('SnakesAndLaddersPage', () => {
  it('configures and starts a local game', () => {
    render(
      <MemoryRouter>
        <SnakesAndLaddersPage />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Player 1 name'), { target: { value: 'Shubham' } })
    fireEvent.click(screen.getByRole('button', { name: /start the race/i }))
    expect(screen.getAllByText('Shubham').length).toBeGreaterThan(0)
    expect(screen.getByRole('grid', { name: /snakes and ladders board/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeEnabled()
  })
})
