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
import { ReliabilityFmecaService } from './fmeca.service';
import { CreateFmecaDto } from './dto/create-fmeca.dto';
import { UpdateFmecaDto } from './dto/update-fmeca.dto';

@Controller('reliability/fmeca')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityFmecaController {
  constructor(private readonly service: ReliabilityFmecaService) {}

  @Post()
  create(@Body() dto: CreateFmecaDto, @Req() req: any) {
    return this.service.create(dto, req.user.organizationId);
  }

  @Get()
  findAll(@Req() req: any, @Query('search') search?: string, @Query('risk') risk?: string) {
    return this.service.findAll(req.user.organizationId, { search, risk });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFmecaDto, @Req() req: any) {
    return this.service.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.organizationId);
  }
}
