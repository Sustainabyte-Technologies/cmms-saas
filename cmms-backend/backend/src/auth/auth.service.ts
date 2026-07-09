import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: dto.adminEmail,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const adminRole = await this.prisma.role.findUnique({
      where: {
        name: 'ADMIN',
      },
    });

    if (!adminRole) {
      throw new BadRequestException('ADMIN role not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.companyName,
      },
    });

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.adminName,
        email: dto.adminEmail,
        passwordHash: hashedPassword,
        phoneNumber: dto.phoneNumber,
        organizationId: organization.id,
        roleId: adminRole.id,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: adminRole.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Organization Registered Successfully',
      organization,
      user,
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
      include: {
        role: true,
        organization: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Account not found. Please register first.');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role.name,
    };

    const token = this.jwtService.sign(payload);

    const { passwordHash, ...safeUser } = user;

    return {
      message: 'Login Successful',
      token,
      user: safeUser,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}