import { Route, Routes } from 'react-router-dom'
import { ChessPage } from '../games/chess/pages/ChessPage'
import { ThreePlayerChessPage } from '../games/three-player-chess/pages/ThreePlayerChessPage'
import { SnakesAndLaddersPage } from '../games/snakes-and-ladders/pages/SnakesAndLaddersPage'
import { LudoPage } from '../games/ludo/pages/LudoPage'
import { NQueensPage } from '../games/n-queens/pages/NQueensPage'
import { WumpusWorldPage } from '../games/wumpus-world/pages/WumpusWorldPage'
import { GamePlaceholder } from '../pages/GamePlaceholder'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/games/chess" element={<ChessPage />} />
      <Route path="/games/three-player-chess" element={<ThreePlayerChessPage />} />
      <Route path="/games/snakes-and-ladders" element={<SnakesAndLaddersPage />} />
      <Route path="/games/ludo" element={<LudoPage />} />
      <Route path="/games/n-queens" element={<NQueensPage />} />
      <Route path="/games/wumpus-world" element={<WumpusWorldPage />} />
      <Route path="/games/:gameId" element={<GamePlaceholder />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
