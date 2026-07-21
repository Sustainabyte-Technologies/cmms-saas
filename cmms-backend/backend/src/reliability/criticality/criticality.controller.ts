import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityCriticalityService } from './criticality.service';

@Controller('reliability/criticality')
@UseGuards(JwtAuthGuard)
export class ReliabilityCriticalityController {
  constructor(
    private readonly criticalityService: ReliabilityCriticalityService,
  ) {}

  @Get()
  async getCriticalityData() {
    return this.criticalityService.getCriticalityPlaceholder();
  }
}
