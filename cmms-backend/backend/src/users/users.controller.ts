import {
  Body,
  Controller,
  Get,
  Query,
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
  ) { }

  @Post()
  @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
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
  @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
  async getUsers(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.getUsers(
      req.user.organizationId,
      req.user.role,
      req.user.sub,
      {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search,
        role,
      },
    );
  }

  @Get('role-dashboard')
  @Roles('ADMIN')
  async getRoleDashboard(@Req() req: any) {
    return this.usersService.getRoleDashboard(req.user.organizationId);
  }

  @Get('technicians/workload')
  @Roles(
    'ADMIN',
    'CUSTOMER_MANAGER',
    'SITE_INCHARGE',
    'SUPERVISOR',
  )
  async getTechnicianWorkload(
    @Req() req: any,
  ) {
    return this.usersService.getTechnicianWorkload(
      req.user.organizationId,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
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
  @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
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
  @Roles('ADMIN', 'CUSTOMER_MANAGER', 'SITE_INCHARGE', 'SUPERVISOR')
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