import prisma from '../../lib/prisma'
import bcrypt from 'bcryptjs'
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'User exists' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hashed } })

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await prisma.session.create({ data: { userId: user.id, expiresAt } })

  res.setHeader('Set-Cookie', cookie.serialize('session', session.id, {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  }))
  return res.json({ ok: true })
}
