import { Module } from '@nestjs/common';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkOrderGateway } from './work-order.gateway';
import { AzureModule } from '../azure/azure.module';
@Module({
  imports: [PrismaModule, AzureModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService, WorkOrderGateway],
})
export class WorkOrdersModule {}