import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Put @UseGuards(JwtAuthGuard) on any route that needs a logged-in user
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
