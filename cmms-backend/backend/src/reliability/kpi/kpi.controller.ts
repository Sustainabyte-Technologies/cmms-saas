import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityKpiService } from './kpi.service';

@Controller('reliability/kpi')
@UseGuards(JwtAuthGuard)
export class ReliabilityKpiController {
  constructor(
    private readonly kpiService: ReliabilityKpiService,
  ) {}

  @Get()
  async getKpiData() {
    return this.kpiService.getKpiPlaceholder();
  }
}
