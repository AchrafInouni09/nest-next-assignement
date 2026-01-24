import prisma from '../../lib/prisma'
import cookie from 'cookie'

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '')
  const sessionId = cookies.session
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } })
  }
  res.setHeader('Set-Cookie', cookie.serialize('session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  }))
  res.json({ ok: true })
}
