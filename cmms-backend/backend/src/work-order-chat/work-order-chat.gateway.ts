import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { WorkOrderChatService } from './work-order-chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WorkOrderChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WorkOrderChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => WorkOrderChatService))
    private readonly chatService: any,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`Disconnecting client ${client.id}: No auth token provided`);
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.user = {
        id: payload.sub || payload.id,
        email: payload.email,
        organizationId: payload.organizationId,
        role: payload.role,
      };

      this.logger.log(`Client Connected: Socket ${client.id} authenticated for User ${client.data.user.id}`);
    } catch (err: any) {
      this.logger.warn(`Disconnecting client ${client.id}: Auth failed - ${err.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: Socket ${client.id}`);
  }

  @SubscribeMessage('joinWorkOrder')
  async handleJoin(
    @MessageBody() payload: { workOrderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      this.logger.warn(`joinWorkOrder rejected: Unauthenticated socket ${client.id}`);
      client.disconnect(true);
      return;
    }

    const { workOrderId } = payload;
    if (!workOrderId) {
      client.emit('workOrderError', { error: 'workOrderId is required' });
      return;
    }

    const hasAccess = await this.chatService.checkWorkOrderAccess(
      user.id,
      workOrderId,
      user.role,
      user.organizationId,
    );

    if (!hasAccess) {
      this.logger.warn(`User ${user.id} denied access to room workorder:${workOrderId}`);
      client.emit('workOrderError', { error: 'You are not authorized to access this Work Order discussion.' });
      return;
    }

    await client.join(`workorder:${workOrderId}`);
    this.logger.log(`User ${user.id} joined room workorder:${workOrderId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveWorkOrder')
  async handleLeave(
    @MessageBody() payload: { workOrderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { workOrderId } = payload;
    if (workOrderId) {
      await client.leave(`workorder:${workOrderId}`);
      this.logger.log(`Socket ${client.id} left room workorder:${workOrderId}`);
    }
    return { success: true };
  }

  @SubscribeMessage('sendWorkOrderMessage')
  async handleSendMessage(
    @MessageBody() payload: { workOrderId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      client.disconnect(true);
      return;
    }

    const { workOrderId, message } = payload;
    if (!workOrderId || !message) {
      client.emit('workOrderError', { error: 'workOrderId and message are required' });
      return;
    }

    try {
      await this.chatService.saveMessage(
        workOrderId,
        user.id,
        message,
        'TEXT',
        user.organizationId,
        user.role,
      );
    } catch (err: any) {
      this.logger.error(`Error saving message: ${err.message}`);
      client.emit('workOrderError', { error: err.message || 'Failed to send message' });
    }
  }
}
