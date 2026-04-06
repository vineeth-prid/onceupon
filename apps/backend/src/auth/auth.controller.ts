import { Controller, Post, Get, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: { firstName: string; lastName: string; email: string; password: string }) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Post('google')
  googleLogin(@Body() body: { googleId: string; email: string; firstName: string; lastName: string; avatarUrl?: string }) {
    return this.authService.googleLogin(body);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@Req() req: any, @Body() body: { firstName?: string; lastName?: string }) {
    return this.authService.updateProfile(req.user.id, body);
  }
}
