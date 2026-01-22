import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { getSession as getDevSession } from './session.store';

let BetterAuthModule: any;
try {
  BetterAuthModule = require('better-auth');
} catch (e) {
  BetterAuthModule = null;
}

@Injectable()
export class BetterAuthGuard implements CanActivate {
  private auth: any;

  constructor() {
    const opts = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      apiKey: process.env.BETTERAUTH_API_KEY,
      secret: process.env.BETTERAUTH_SECRET,
    };

    if (!BetterAuthModule) {
      this.auth = null;
      return;
    }

    const mod = BetterAuthModule.default ?? BetterAuthModule;

    if (typeof mod === 'function') {
      this.auth = mod(opts);
    } else if (mod && typeof mod.api === 'function') {
      this.auth = mod.api(opts);
    } else if (mod && typeof mod.getSession === 'function') {
      this.auth = mod;
    } else {
      this.auth = null;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    
    if (this.auth) {
      const getSession =
        typeof this.auth.getSession === 'function'
          ? this.auth.getSession.bind(this.auth)
          : this.auth.api && typeof this.auth.api.getSession === 'function'
          ? this.auth.api.getSession.bind(this.auth.api)
          : null;

      if (getSession) {
        const session = await getSession({ req });
        if (session) {
          (req as any).user = session.user ?? session;
          return true;
        }
      }
    }

    
    const token = (req as any).cookies?.dev_session;
    if (token) {
      const s = getDevSession(token);
      if (s) {
        (req as any).user = { email: s.email, name: s.name };
        return true;
      }
    }

    throw new UnauthorizedException('Unauthorized');
  }
}