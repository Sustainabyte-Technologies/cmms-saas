import { Injectable } from '@nestjs/common';

@Injectable()
export class ReliabilityFailureLibraryService {
  async getFailureLibraryPlaceholder() {
    return {
      message: 'Coming Soon',
    };
  }
}
