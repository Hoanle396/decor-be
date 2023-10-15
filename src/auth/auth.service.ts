import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && user.password) {
      const match = await bcrypt.compare(pass, user.password);
      if (match) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }
    return null;
  }
  login(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      isVerify: user.isVerify,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30 days' }),
      user: user,
    };
  }
  async register(users: CreateUserDto): Promise<any> {
    try {
      users.password = await bcrypt.hash(users.password, 12);
      const { password, ...result } = await this.usersService.save(users);
      return result;
    } catch {
      return null;
    }
  }
}
