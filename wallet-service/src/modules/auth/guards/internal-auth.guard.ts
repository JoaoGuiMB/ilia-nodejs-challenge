import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class InternalAuthGuard extends AuthGuard('internal-jwt') {}
