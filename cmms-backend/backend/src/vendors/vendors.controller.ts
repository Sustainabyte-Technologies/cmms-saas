import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VendorStatus } from '@prisma/client';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  create(@Body() dto: CreateVendorDto, @Req() req: any) {
    return this.vendorsService.create(dto, req.user.organizationId, req.user.id);
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('status') status: VendorStatus,
    @Query('category') category: string,
    @Req() req: any,
  ) {
    return this.vendorsService.findAll(req.user.organizationId, { search, status, category });
  }

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.vendorsService.getDashboard(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.vendorsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVendorDto, @Req() req: any) {
    return this.vendorsService.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.vendorsService.remove(id, req.user.organizationId);
  }
}
