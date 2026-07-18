import { Route, Routes } from 'react-router-dom'
import { ChessPage } from '../games/chess/pages/ChessPage'
import { GamePlaceholder } from '../pages/GamePlaceholder'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games/chess" element={<ChessPage />} />
      <Route path="/games/:gameId" element={<GamePlaceholder />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
