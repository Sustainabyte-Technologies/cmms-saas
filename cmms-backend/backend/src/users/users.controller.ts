import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @Roles('ADMIN', 'MAINTENANCE_MANAGER')
  async createUser(
    @Body() dto: CreateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.createUser(
      dto,
      req.user.organizationId,
      req.user.sub,
      req.user.role,
    );
  }

  @Get()
  @Roles('ADMIN', 'MAINTENANCE_MANAGER')
  async getUsers(@Req() req: any) {
    return this.usersService.getUsers(
      req.user.organizationId,
      req.user.role,
      req.user.sub,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'MAINTENANCE_MANAGER')
  async getUserById(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.usersService.getUserById(
      id,
      req.user.organizationId,
      req.user.role,
      req.user.sub,
    );
  }

  @Patch(':id')
  @Roles('ADMIN', 'MAINTENANCE_MANAGER')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.updateUser(
      id,
      dto,
      req.user.organizationId,
      req.user.role,
      req.user.sub,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'MAINTENANCE_MANAGER')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.usersService.deleteUser(
      id,
      req.user.organizationId,
      req.user.role,
      req.user.sub,
    );
  }
}