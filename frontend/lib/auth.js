
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from './prisma'

export const auth = betterAuth({
  adapter: prismaAdapter(prisma, { provider: 'postgresql', usePlural: false }),
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials || {}
        if (!email || !password) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const bcrypt = await import('bcryptjs')
        const ok = await bcrypt.compare(password, user.password)
        if (!ok) return null
        return { id: user.id, email: user.email }
      },
    },
  ],
})

