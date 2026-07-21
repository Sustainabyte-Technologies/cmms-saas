import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityRcaService {
  async getRcaPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
