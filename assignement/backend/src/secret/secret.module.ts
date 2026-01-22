import { Module } from '@nestjs/common';
import { SecretController } from './secret.controller';
import { BetterAuthGuard } from '../auth/better-auth.guard';

@Module({
  controllers: [SecretController],
  providers: [BetterAuthGuard],
})
export class SecretModule {}