import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityDashboardService {
  async getDashboardPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
