import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityRcaService } from './rca.service';

@Controller('reliability/rca')
@UseGuards(JwtAuthGuard)
export class ReliabilityRcaController {
  constructor(
    private readonly rcaService: ReliabilityRcaService,
  ) {}

  @Get()
  async getRcaData() {
    return this.rcaService.getRcaPlaceholder();
  }
}
