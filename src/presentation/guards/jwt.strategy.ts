// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { AuthenticatedUserDto } from '../../application/dto/user/authenticated-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        console.log('JWT Strategy initialized with:');
        console.log('Domain:', process.env.AUTH0_DOMAIN);
        console.log('Audience:', process.env.AUTH0_AUDIENCE);
        console.log('JWKS URI:', `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`);

        super({
            // 1️⃣ de dónde sacar la clave pública
            secretOrKeyProvider: jwksRsa.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
                handleSigningKeyError: (err, cb) => {
                    console.error('JWKS Error:', err);
                    cb(err);
                }
            }),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: process.env.AUTH0_AUDIENCE,
            issuer: `${process.env.AUTH0_DOMAIN}/`,
            algorithms: ['RS256'],
        });
    }

    async validate(payload: any): Promise<AuthenticatedUserDto> {
        console.log('JWT Payload received:', payload);

        if (!payload) {
            throw new UnauthorizedException('Invalid token payload');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            ...payload
        };
    }
}
