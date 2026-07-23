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
import { ReliabilityRcaService } from './rca.service';
import { CreateRcaDto } from './dto/create-rca.dto';
import { UpdateRcaDto } from './dto/update-rca.dto';

@Controller('reliability/rca')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityRcaController {
  constructor(private readonly service: ReliabilityRcaService) {}

  @Post()
  create(@Body() dto: CreateRcaDto, @Req() req: any) {
    return this.service.create(dto, req.user.organizationId, req.user.sub);
  }

  @Get()
  findAll(@Req() req: any, @Query('search') search?: string, @Query('status') status?: string) {
    return this.service.findAll(req.user.organizationId, { search, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRcaDto, @Req() req: any) {
    return this.service.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.organizationId);
  }
}
