import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy],
  exports: [PassportModule],       // para usar AuthGuard fuera del módulo
})
export class AuthModule {}