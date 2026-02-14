import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class InternalJwtStrategy extends PassportStrategy(
  Strategy,
  'internal-jwt',
) {
  constructor(private readonly configService: ConfigService) {
    const jwtInternalSecret = configService.get<string>('JWT_INTERNAL_SECRET');

    if (!jwtInternalSecret) {
      throw new Error('JWT_INTERNAL_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtInternalSecret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      email: payload.email,
    };
  }
}
