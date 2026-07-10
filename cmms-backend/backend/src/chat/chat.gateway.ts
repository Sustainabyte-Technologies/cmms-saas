import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // No connectedUsers Map is needed as we use Socket.IO rooms to track online users and broadcast messages.

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Connection request from socket client: ${client.id}`);

    // Extract token from query parameters, auth object, authorization header, or cookies
    let token: string | undefined;

    // 1. Check query parameter
    if (client.handshake.query && client.handshake.query.token) {
      token = client.handshake.query.token as string;
    }

    // 2. Check auth object
    if (!token && client.handshake.auth && client.handshake.auth.token) {
      token = client.handshake.auth.token as string;
    }

    // 3. Check authorization header
    if (!token && client.handshake.headers.authorization) {
      const authHeader = client.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else {
        token = authHeader;
      }
    }

    // 4. Check cookies
    if (!token && client.handshake.headers.cookie) {
      const cookieHeader = client.handshake.headers.cookie;
      const match = cookieHeader.match(/access_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      this.logger.warn(`Disconnecting client ${client.id}: No authentication token provided.`);
      client.disconnect(true);
      return;
    }

    try {
      // Verify JWT and get payload
      const payload = this.jwtService.verify(token);

      // Store authenticated user context in client data
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId,
        role: payload.role,
      };

      // Join the user to their private room (supports multi-device/multi-tab connections)
      await client.join(payload.sub);
      this.logger.log(`Client authenticated: User ${payload.sub} (${payload.role}) connected via socket ${client.id}`);
    } catch (error: any) {
      this.logger.warn(`Disconnecting client ${client.id}: Invalid token. Error: ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`Client disconnected: User ${user.id} disconnected from socket ${client.id}`);
    } else {
      this.logger.log(`Client disconnected: Unauthenticated client ${client.id}`);
    }
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    if (!user) {
      client.disconnect(true);
      return { event: 'joinResponse', data: { success: false, error: 'Unauthorized' } };
    }

    // Double check room membership
    client.join(user.id);
    this.logger.log(`Join event: User ${user.id} registered on socket ${client.id}`);

    return { event: 'joinResponse', data: { success: true, userId: user.id } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId: string; message: string },
  ) {
    const sender = client.data.user;
    if (!sender) {
      this.logger.warn(`Rejecting sendMessage from socket ${client.id}: Unauthenticated`);
      client.disconnect(true);
      return;
    }

    const { receiverId, message } = payload;
    if (!receiverId || !message) {
      this.logger.warn(`Invalid sendMessage payload from User ${sender.id}: receiverId or message missing`);
      return;
    }

    try {
      this.logger.log(`User ${sender.id} is sending message to User ${receiverId}`);

      // Validate role-based hierarchy permission
      const hasPermission = await this.chatService.checkCommunicationPermission(
        sender.id,
        receiverId,
        sender.organizationId,
      );
      if (!hasPermission) {
        this.logger.warn(`Rejecting sendMessage from User ${sender.id} to User ${receiverId}: Forbidden`);
        client.emit('messageError', { error: 'You are not allowed to communicate with this user.' });
        return;
      }

      // Step 3: Save message to PostgreSQL database first
      const savedMessage = await this.chatService.saveMessage(sender.id, receiverId, message);

      // Step 4 & 5: Relate message to receiver if online (checks room membership)
      const receiverRoom = this.server.sockets.adapter.rooms.get(receiverId);
      const isOnline = receiverRoom && receiverRoom.size > 0;
      if (isOnline) {
        this.logger.log(`Receiver ${receiverId} is online in room (connections: ${receiverRoom.size}). Emitting receiveMessage.`);
        this.server.to(receiverId).emit('receiveMessage', savedMessage);
      } else {
        this.logger.log(`Receiver ${receiverId} is offline. Saved to database.`);
      }

      // Step 6: Acknowledge sender
      client.emit('messageSent', savedMessage);
    } catch (error: any) {
      this.logger.error(`Error saving/delivering message: ${error.message}`);
      client.emit('messageError', { error: 'Failed to send message' });
    }
  }
}
