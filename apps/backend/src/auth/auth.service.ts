import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: { firstName: string; lastName: string; email: string; password: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        authProvider: 'EMAIL',
        isVerified: false,
      },
    });

    const token = this.signToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
  }

  async googleLogin(dto: { credential: string }) {
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${dto.credential}`);
      if (!res.ok) {
        throw new UnauthorizedException('Invalid Google token');
      }
      const data = await res.json();
      
      const email = data.email;
      const googleId = data.sub;
      const firstName = data.given_name || 'User';
      const lastName = data.family_name || '';
      const avatarUrl = data.picture;

      let user = await this.prisma.user.findUnique({ where: { googleId } });

      if (!user) {
        // Check if email exists with different provider
        const emailUser = await this.prisma.user.findUnique({ where: { email } });
        if (emailUser) {
          user = await this.prisma.user.update({
            where: { id: emailUser.id },
            data: { googleId, avatarUrl: avatarUrl || emailUser.avatarUrl, isVerified: true },
          });
        } else {
          user = await this.prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              googleId,
              avatarUrl,
              authProvider: 'GOOGLE',
              isVerified: true,
            },
          });
        }
      }

      const token = this.signToken(user.id, user.email, user.role);
      return { token, user: this.sanitizeUser(user) };
    } catch (error) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }


  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string; phone?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return this.sanitizeUser(user);
  }

  async adminResetPassword(dto: { email: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.role !== 'ADMIN') throw new UnauthorizedException('Access denied');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return { message: 'Password reset successful' };
  }

  private signToken(userId: string, email: string, role: string): string {
    return this.jwt.sign({ sub: userId, email, role });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

