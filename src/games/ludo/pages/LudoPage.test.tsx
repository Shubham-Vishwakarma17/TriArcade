import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LudoPage } from './LudoPage'

describe('LudoPage', () => {
  it('configures and starts a local game', () => {
    render(
      <MemoryRouter>
        <LudoPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: '2 players' }))
    fireEvent.change(screen.getByLabelText('Player 1 name'), { target: { value: 'Shubham' } })
    fireEvent.click(screen.getByRole('button', { name: /start ludo/i }))
    expect(screen.getByRole('grid', { name: /ludo board/i })).toBeInTheDocument()
    expect(screen.getAllByText('Shubham').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /roll dice/i })).toBeEnabled()
    const firstToken = screen.getByRole('button', { name: 'Shubham token 1' })
    expect(firstToken).toHaveStyle({ left: '16.666666666666664%', top: '16.666666666666664%' })
  })
})
