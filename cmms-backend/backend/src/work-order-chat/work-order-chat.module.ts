import { Module, forwardRef } from '@nestjs/common';
import { WorkOrderChatService } from './work-order-chat.service';
import { WorkOrderChatGateway } from './work-order-chat.gateway';
import { WorkOrderChatController } from './work-order-chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  providers: [WorkOrderChatService, WorkOrderChatGateway],
  controllers: [WorkOrderChatController],
  exports: [WorkOrderChatService],
})
export class WorkOrderChatModule {}
