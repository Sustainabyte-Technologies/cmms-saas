import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ReliabilityFailureHistoryService } from './failure-history.service';
import { CreateFailureHistoryDto } from './dto/create-failure-history.dto';

@Controller('reliability/failure-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityFailureHistoryController {
  constructor(private readonly service: ReliabilityFailureHistoryService) {}

  @Post()
  create(@Body() dto: CreateFailureHistoryDto, @Req() req: any) {
    return this.service.create(dto, req.user.organizationId);
  }

  @Post('sync')
  sync(@Req() req: any) {
    return this.service.syncCompletedWorkOrders(req.user.organizationId);
  }

  @Get()
  findAll(@Req() req: any, @Query('search') search?: string, @Query('assetId') assetId?: string) {
    return this.service.findAll(req.user.organizationId, { search, assetId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.organizationId);
  }
}
