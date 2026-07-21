import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityReportsService {
  async getReportsPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
