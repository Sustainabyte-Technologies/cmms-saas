import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { ChecklistModule } from './checklist/checklist.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, AssetsModule, WorkOrdersModule, ChecklistModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
