import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { createSession, getSession, deleteSession, createUser, verifyUser } from './session.store';

type AuthBody = { email: string; name?: string; password?: string };

@Controller('auth')
export class AuthController {
  @Post('signup')
  signup(@Body() body: AuthBody, @Res() res: Response) {
    const { email, name, password } = body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    const created = createUser(email, name || email, password);
    if (!created) {
      return res.status(409).json({ error: 'user already exists' });
    }
    const token = createSession(email, name || email);
    res.cookie('dev_session', token, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return res.json({ ok: true });
  }

  @Post('login')
  login(@Body() body: AuthBody, @Res() res: Response) {
    const { email, password } = body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    const user = verifyUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const token = createSession(user.email, user.name || user.email);
    res.cookie('dev_session', token, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return res.json({ ok: true });
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.dev_session;
    deleteSession(token);
    res.clearCookie('dev_session');
    return res.json({ ok: true });
  }
}
