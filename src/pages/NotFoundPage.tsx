import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="centered-page">
      <p className="eyebrow">404</p>
      <h1>Wrong turn.</h1>
      <p>That square does not exist on this board.</p>
      <Link className="primary-button" to="/">
        Return home
      </Link>
    </main>
  )
}
