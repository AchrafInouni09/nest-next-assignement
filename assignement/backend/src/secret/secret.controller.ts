import {Controller, Get, Req, UnauthorizedException} from '@nestjs/common';
import {Request} from 'express';
import { auth as configuredAuth } from '../auth/better-auth';
import { getSession as getDevSession } from '../auth/session.store';


@Controller ('secret')
export class SecretController
{
    @Get ()
    async getSecret (@Req() req: Request)
    {
        // Try BetterAuth session first
        if (configuredAuth) {
            const getSession =
                typeof configuredAuth.getSession === 'function'
                    ? configuredAuth.getSession.bind(configuredAuth)
                    : configuredAuth.api && typeof configuredAuth.api.getSession === 'function'
                    ? configuredAuth.api.getSession.bind(configuredAuth.api)
                    : null;

            if (getSession) {
                const session = await getSession({ req });
                if (session) {
                    const user = session.user ?? session;
                    const name = user.name || user.email || 'user';
                    return {message: `This is a protected message for ${name}`};
                }
            }
        }

        // Fallback to dev session store
        const token = (req as any).cookies?.dev_session;
        if (token) {
            const s = getDevSession(token);
            if (s) {
                const name = s.name || s.email || 'user';
                return {message: `This is a protected message for ${name}`};
            }
        }

        throw new UnauthorizedException('Unauthorized');
    }
}