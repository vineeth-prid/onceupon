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

  async googleLogin(dto: { googleId: string; email: string; firstName: string; lastName: string; avatarUrl?: string }) {
    let user = await this.prisma.user.findUnique({ where: { googleId: dto.googleId } });

    if (!user) {
      // Check if email exists with different provider
      const emailUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (emailUser) {
        // Link Google to existing account
        user = await this.prisma.user.update({
          where: { id: emailUser.id },
          data: { googleId: dto.googleId, avatarUrl: dto.avatarUrl || emailUser.avatarUrl, isVerified: true },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            googleId: dto.googleId,
            avatarUrl: dto.avatarUrl,
            authProvider: 'GOOGLE',
            isVerified: true,
          },
        });
      }
    }

    const token = this.signToken(user.id, user.email, user.role);
    return { token, user: this.sanitizeUser(user) };
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

  private signToken(userId: string, email: string, role: string): string {
    return this.jwt.sign({ sub: userId, email, role });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
