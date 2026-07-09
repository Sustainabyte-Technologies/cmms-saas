import { Controller, Get, Req, UseGuards, Param, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('available-users')
  async getAvailableUsers(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const role = req.user.role;
    const organizationId = req.user.organizationId;
    return this.chatService.getAvailableUsers(userId, role, organizationId);
  }

  @Get('messages/:otherUserId')
  async getChatMessages(
    @Req() req: any,
    @Param('otherUserId') otherUserId: string,
  ) {
    const userId = req.user.sub || req.user.id;
    const organizationId = req.user.organizationId;

    const hasPermission = await this.chatService.checkCommunicationPermission(
      userId,
      otherUserId,
      organizationId,
    );
    if (!hasPermission) {
      throw new ForbiddenException('You are not allowed to communicate with this user.');
    }

    return this.chatService.getMessages(userId, otherUserId);
  }
}
