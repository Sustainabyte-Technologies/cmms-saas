import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityKpiService {
  async getKpiPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
