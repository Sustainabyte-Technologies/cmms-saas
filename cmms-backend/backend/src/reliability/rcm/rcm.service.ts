import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityRcmService {
  async getRcmPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
