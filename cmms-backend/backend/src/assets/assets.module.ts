import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AzureModule } from '../azure/azure.module';

@Module({
  imports: [AzureModule, PrismaModule],
  controllers: [AssetsController],
  providers: [
    AssetsService,
  ],
})
export class AssetsModule {}