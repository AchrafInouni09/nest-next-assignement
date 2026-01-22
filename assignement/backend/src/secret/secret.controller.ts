import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {Request} from 'express';
import { BetterAuthGuard } from '../auth/better-auth.guard';


@Controller ('secret')
export class SecretController
{
    @Get ()
    @UseGuards (BetterAuthGuard)
    getSecret (@Req() req: Request)
    {
        const user = (req as any).user || {};
        const name = user.name || user.email || 'user';
        return {message: `This is a protected message for ${name}`};
    }
}