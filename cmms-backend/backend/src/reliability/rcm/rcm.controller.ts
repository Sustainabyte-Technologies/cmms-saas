import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityRcmService } from './rcm.service';

@Controller('reliability/rcm')
@UseGuards(JwtAuthGuard)
export class ReliabilityRcmController {
  constructor(
    private readonly rcmService: ReliabilityRcmService,
  ) {}

  @Get()
  async getRcmData() {
    return this.rcmService.getRcmPlaceholder();
  }
}
