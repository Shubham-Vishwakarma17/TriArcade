import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('shows the game arena home page', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /pick a board/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Classic Chess' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'N-Queens' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wumpus World' })).toBeInTheDocument()
    expect(screen.getAllByText('Play')).toHaveLength(6)
  })
})
