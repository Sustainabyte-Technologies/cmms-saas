import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReliabilityFailureLibraryService } from './failure-library.service';

@Controller('reliability/failure-library')
@UseGuards(JwtAuthGuard)
export class ReliabilityFailureLibraryController {
  constructor(
    private readonly failureLibraryService: ReliabilityFailureLibraryService,
  ) {}

  @Get()
  async getFailureLibraryData() {
    return this.failureLibraryService.getFailureLibraryPlaceholder();
  }
}
