import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private emailService: EmailService,
    private config: ConfigService,
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { message: 'If your email is registered, a reset link will be sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });

    return { message: 'If your email is registered, a reset link will be sent.' };
  }

  async resetPassword(dto: { token: string; newPassword: string }) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
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

