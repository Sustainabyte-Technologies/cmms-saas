import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ReliabilityDashboardService } from './dashboard.service';

@Controller('reliability/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityDashboardController {
  constructor(private readonly service: ReliabilityDashboardService) {}

  @Get()
  getDashboard(@Req() req: any) {
    return this.service.getDashboard(req.user.organizationId);
  }
}
