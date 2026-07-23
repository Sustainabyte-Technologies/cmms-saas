import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ReliabilityKpiService } from './kpi.service';

@Controller('reliability/kpis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityKpiController {
  constructor(private readonly service: ReliabilityKpiService) {}

  @Get()
  getKpis(@Req() req: any) {
    return this.service.getKpis(req.user.organizationId);
  }

  @Get('assets')
  getAssetKpis(@Req() req: any) {
    return this.service.getAssetKpis(req.user.organizationId);
  }
}
