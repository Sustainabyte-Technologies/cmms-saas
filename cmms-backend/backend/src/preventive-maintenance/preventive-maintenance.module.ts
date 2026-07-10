import { Module } from '@nestjs/common';
import { PreventiveMaintenanceService } from './preventive-maintenance.service';
import { PreventiveMaintenanceController } from './preventive-maintenance.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PreventiveMaintenanceController],
  providers: [PreventiveMaintenanceService],
})
export class PreventiveMaintenanceModule {}
