import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityReportsService } from './reports.service';

@Controller('reliability/reports')
@UseGuards(JwtAuthGuard)
export class ReliabilityReportsController {
  constructor(
    private readonly reportsService: ReliabilityReportsService,
  ) {}

  @Get()
  async getReportsData() {
    return this.reportsService.getReportsPlaceholder();
  }
}
