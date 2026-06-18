import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WorkOrderGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(
      'Client Connected:',
      client.id,
    );
  }

  handleDisconnect(client: Socket) {
    console.log(
      'Client Disconnected:',
      client.id,
    );
  }

  @SubscribeMessage('join-work-order')
  handleJoin(
    @MessageBody() workOrderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(workOrderId);

    console.log(
      `Client joined room: ${workOrderId}`,
    );

    return {
      success: true,
      message: `Joined ${workOrderId}`,
    };
  }

  @SubscribeMessage('leave-work-order')
  handleLeave(
    @MessageBody() workOrderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(workOrderId);

    console.log(
      `Client left room: ${workOrderId}`,
    );

    return {
      success: true,
      message: `Left ${workOrderId}`,
    };
  }
}