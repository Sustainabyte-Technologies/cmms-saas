import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AzureModule } from '../azure/azure.module';

@Module({
  imports: [PrismaModule, AzureModule],
  controllers: [CustomersController],
  providers: [CustomersService]
})
export class CustomersModule {}

