import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityFailureHistoryService {
  async getFailureHistoryPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
