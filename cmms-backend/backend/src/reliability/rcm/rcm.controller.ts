import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ReliabilityRcmService } from './rcm.service';
import { CreateRcmDto } from './dto/create-rcm.dto';
import { UpdateRcmDto } from './dto/update-rcm.dto';

@Controller('reliability/rcm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityRcmController {
  constructor(private readonly service: ReliabilityRcmService) {}

  @Post()
  create(@Body() dto: CreateRcmDto, @Req() req: any) {
    return this.service.create(dto, req.user.organizationId);
  }

  @Get()
  findAll(@Req() req: any, @Query('search') search?: string, @Query('strategy') strategy?: string) {
    return this.service.findAll(req.user.organizationId, { search, strategy });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRcmDto, @Req() req: any) {
    return this.service.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.organizationId);
  }
}
