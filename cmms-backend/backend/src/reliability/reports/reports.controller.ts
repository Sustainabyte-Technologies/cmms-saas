import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ReliabilityReportsService } from './reports.service';

@Controller('reliability/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReliabilityReportsController {
  constructor(private readonly service: ReliabilityReportsService) {}

  @Get()
  getReportsSummary(@Req() req: any) {
    return this.service.getReportsSummary(req.user.organizationId);
  }
}
