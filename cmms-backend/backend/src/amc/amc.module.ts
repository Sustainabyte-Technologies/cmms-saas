import { Module } from '@nestjs/common';
import { AMCController } from './controllers/amc.controller';
import { AMCService } from './services/amc.service';
import { AMCRepository } from './repositories/amc.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AMCController],
  providers: [AMCService, AMCRepository],
  exports: [AMCService, AMCRepository],
})
export class AMCModule {}
