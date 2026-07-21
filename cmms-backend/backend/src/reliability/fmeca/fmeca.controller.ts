import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityFmecaService } from './fmeca.service';

@Controller('reliability/fmeca')
@UseGuards(JwtAuthGuard)
export class ReliabilityFmecaController {
  constructor(
    private readonly fmecaService: ReliabilityFmecaService,
  ) {}

  @Get()
  async getFmecaData() {
    return this.fmecaService.getFmecaPlaceholder();
  }
}
