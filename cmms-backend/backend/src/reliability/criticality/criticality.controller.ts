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
import { ReliabilityCriticalityService } from './criticality.service';
import { CreateAssetCriticalityDto } from './dto/create-criticality.dto';
import { UpdateAssetCriticalityDto } from './dto/update-criticality.dto';

@Controller('reliability/criticality')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityCriticalityController {
  constructor(private readonly service: ReliabilityCriticalityService) {}

  @Post()
  create(@Body() dto: CreateAssetCriticalityDto, @Req() req: any) {
    return this.service.create(dto, req.user.organizationId, req.user.sub);
  }

  @Get()
  findAll(@Req() req: any, @Query('search') search?: string, @Query('level') level?: string) {
    return this.service.findAll(req.user.organizationId, { search, level });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssetCriticalityDto, @Req() req: any) {
    return this.service.update(id, dto, req.user.organizationId, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.organizationId);
  }
}
