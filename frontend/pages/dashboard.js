import prisma from '../lib/prisma'
import cookie from 'cookie'
import { useEffect, useState } from 'react'

export default function Dashboard({ user }) {
  const [secret, setSecret] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/secret', { credentials: 'same-origin' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message || 'Unauthorized')
        }
        const json = await res.json()
        setSecret(json.message)
      } catch (err) {
        setError(String(err))
      }
    }
    load()
  }, [])

  if (!user) return <div style={{ padding: 24 }}><h1>Not authenticated</h1></div>
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Signed in as: {user.email}</p>
      <p><strong>Secret:</strong> {secret ?? (error ? `Error: ${error}` : 'Loading...')}</p>
      <form method="post" action="/api/signout">
        <button type="submit">Sign out</button>
      </form>
    </div>
  )
}

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers.cookie || '')
  const sessionId = cookies.session || null
  if (!sessionId) return { props: { user: null } }

  const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } })
  if (!session) return { props: { user: null } }
  if (new Date(session.expiresAt) < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } })
    return { props: { user: null } }
  }
  return { props: { user: { id: session.user.id, email: session.user.email } } }
}
