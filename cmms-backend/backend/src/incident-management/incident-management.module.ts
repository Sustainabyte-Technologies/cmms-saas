import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IncidentManagementController } from './controllers/incident-management.controller';
import { IncidentManagementService } from './services/incident-management.service';
import { IncidentManagementRepository } from './repositories/incident-management.repository';

@Module({
  imports: [PrismaModule],
  controllers: [IncidentManagementController],
  providers: [IncidentManagementService, IncidentManagementRepository],
  exports: [IncidentManagementService, IncidentManagementRepository],
})
export class IncidentManagementModule {}
