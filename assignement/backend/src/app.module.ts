import {Module} from '@nestjs/common';
import {SecretModule} from './secret/secret.module';
import {AuthModule} from './auth/auth.module';
import {HealthController} from './health.controller';

@Module ({imports: [SecretModule, AuthModule], controllers: [HealthController]})

export class AppModule {}