import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityFailureHistoryService } from './failure-history.service';

@Controller('reliability/failure-history')
@UseGuards(JwtAuthGuard)
export class ReliabilityFailureHistoryController {
  constructor(
    private readonly failureHistoryService: ReliabilityFailureHistoryService,
  ) {}

  @Get()
  async getFailureHistoryData() {
    return this.failureHistoryService.getFailureHistoryPlaceholder();
  }
}
