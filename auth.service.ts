import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  private buildResponse(user: UserDocument) {
    const id = user._id.toString();
    const token = this.jwt.sign({ sub: id, email: user.email });
    return { token, user: { id, name: user.name, email: user.email } };
  }

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('An account with this email already exists');
    }
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({ ...dto, password });
    return this.buildResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    return this.buildResponse(user);
  }
}
