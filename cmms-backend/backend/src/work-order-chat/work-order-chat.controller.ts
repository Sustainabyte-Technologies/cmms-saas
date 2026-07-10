import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { WorkOrderChatService } from './work-order-chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('work-order-chat')
@UseGuards(JwtAuthGuard)
export class WorkOrderChatController {
  constructor(private readonly chatService: WorkOrderChatService) {}

  @Get('messages/:workOrderId')
  async getMessages(
    @Param('workOrderId') workOrderId: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.id;
    const role = req.user.role;
    const organizationId = req.user.organizationId;
    return this.chatService.getMessages(workOrderId, userId, role, organizationId);
  }
}
