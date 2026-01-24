import prisma from '../../lib/prisma'
import bcrypt from 'bcryptjs'
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await prisma.session.create({ data: { userId: user.id, expiresAt } })

  res.setHeader('Set-Cookie', cookie.serialize('session', session.id, {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  }))
  return res.json({ ok: true })
}
