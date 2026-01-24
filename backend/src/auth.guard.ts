import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Pool } from 'pg'
import cookie from 'cookie'

const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER||'user'}:${process.env.DB_PASSWORD||'password'}@${process.env.DB_HOST||'db'}:${process.env.DB_PORT||'5432'}/${process.env.DB_NAME||'appdb'}` })

@Injectable()
export class BetterAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const cookies = cookie.parse(req.headers.cookie || '')
    const sessionId = cookies.session
    if (!sessionId) throw new UnauthorizedException()

    const client = await pool.connect()
    try {
      const q = `SELECT s.id, s."expiresAt" as "expiresAt", u.id as user_id, u.email as email FROM "Session" s JOIN "User" u ON s."userId" = u.id WHERE s.id = $1`;
      const result = await client.query(q, [sessionId])
      if (!result.rows || result.rows.length === 0) throw new UnauthorizedException()
      const row = result.rows[0]
      if (new Date(row.expiresAt) < new Date()) {
        await client.query('DELETE FROM "Session" WHERE id = $1', [sessionId]).catch(()=>{})
        throw new UnauthorizedException()
      }
      req.user = { id: row.user_id, email: row.email }
      return true
    } finally {
      client.release()
    }
  }
}
