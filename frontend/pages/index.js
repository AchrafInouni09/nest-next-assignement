import React from 'react'
import Link from 'next/link'
import { Client } from 'pg'
import cookie from 'cookie'
import prisma from '../lib/prisma'

export default function Home({ connected, error, user }) {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>My App</h1>
        <nav>
          {user ? (
            <>
              <Link href="/dashboard"><a style={{ marginRight: 12 }}>Dashboard</a></Link>
              <form method="post" action="/api/signout" style={{ display: 'inline' }}>
                <button type="submit" style={{ padding: '6px 12px' }}>Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/signin"><a style={{ marginRight: 12 }}>Sign in</a></Link>
              <Link href="/signup"><a style={{ padding: '6px 12px', background: '#0070f3', color: '#fff', borderRadius: 4, textDecoration: 'none' }}>Sign up</a></Link>
            </>
          )}
        </nav>
      </header>

      <main style={{ marginTop: 24 }}>
        <h2>{connected ? 'Connected to DB' : 'Not connected to DB'}</h2>
        {error && <pre style={{ whiteSpace: 'pre-wrap', color: 'crimson' }}>{error}</pre>}
        <p>{user ? `Signed in as ${user.email}` : 'Welcome — please sign in or sign up to continue.'}</p>
      </main>
    </div>
  )
}

export async function getServerSideProps({ req }) {
  const client = new Client({
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'appdb',
  })

  let connected = false
  let error = null
  try {
    await client.connect()
    await client.query('SELECT 1')
    await client.end()
    connected = true
  } catch (err) {
    connected = false
    error = String(err)
  }

  const cookies = cookie.parse(req.headers.cookie || '')
  const sessionId = cookies.session || null
  if (!sessionId) return { props: { connected, error, user: null } }

  const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } })
  if (!session) return { props: { connected, error, user: null } }
  if (new Date(session.expiresAt) < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(()=>{})
    return { props: { connected, error, user: null } }
  }

  return { props: { connected, error, user: { id: session.user.id, email: session.user.email } } }
}
