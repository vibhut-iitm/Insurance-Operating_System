import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: await this.jwt.signAsync(payload), user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } });
    if (!user) throw new UnauthorizedException('User account not found');
    return user;
  }
}