import { Module } from '@nestjs/common';
import { SecretController } from './secret.controller';

@Module({
  controllers: [SecretController],
})
export class SecretModule {}