import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ProfileCompletedGuard } from './profile-completed.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [JwtStrategy, ProfileCompletedGuard],
  exports: [PassportModule, ProfileCompletedGuard],       // para usar AuthGuard fuera del módulo
})
export class AuthModule {}