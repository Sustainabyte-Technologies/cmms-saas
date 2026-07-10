import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: result.message,
      organization: result.organization,
      user: result.user,
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: result.message,
      user: result.user,
      token: result.token,
    };
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const user = await this.authService.getMe(req.user.sub);
    return {
      message: 'Authenticated User',
      user: {
        ...user,
        sub: user.id,
      },
    };
  }
}