import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityCriticalityService {
  async getCriticalityPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
