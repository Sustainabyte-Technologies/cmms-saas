import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityFmecaService {
  async getFmecaPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
