import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityDashboardService } from './dashboard.service';

@Controller('reliability/dashboard')
@UseGuards(JwtAuthGuard)
export class ReliabilityDashboardController {
  constructor(
    private readonly dashboardService: ReliabilityDashboardService,
  ) {}

  @Get()
  async getDashboardData() {
    return this.dashboardService.getDashboardPlaceholder();
  }
}
