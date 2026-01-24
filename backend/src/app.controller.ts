import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { BetterAuthGuard } from './auth.guard'

@Controller()
export class AppController {
  @Get('secret')
  @UseGuards(BetterAuthGuard)
  secret(@Req() req: any) {
    const user = req.user || { email: 'unknown' }
    return { message: `This is a protected message for ${user.email}` }
  }
}
