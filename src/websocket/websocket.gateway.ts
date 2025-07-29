import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io";
import { Injectable, Logger, UseGuards } from "@nestjs/common";
import { MessagesService } from "../messages/messages.service";
import { FamiliesService } from "../families/families.service";

interface JoinRoomData {
  familyId: string;
  userId: string;
  username?: string;
}

interface SendMessageData {
  familyId: string;
  userId: string;
  content: string;
  username?: string;
}

interface TypingData {
  familyId: string;
  userId: string;
  username?: string;
  isTyping: boolean;
}

@WebSocketGateway({
  cors: {
    origin: [
      "https://fearlessfamily.vercel.app",
      "https://fearlessfamily-git-master-iftekhar1405s-projects.vercel.app",
      "https://fearlessfamily-dh54bjp38-iftekhar1405s-projects.vercel.app",
      "http://localhost:3000",
      "http://localhost:3002",
    ],
    credentials: true,
  },
  namespace: "/chat",
})
@Injectable()
export class WebSocketGateways
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedUsers = new Map<
    string,
    { socketId: string; familyId?: string; username?: string }
  >();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly familiesService: FamiliesService
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Store the connection
    this.connectedUsers.set(client.id, { socketId: client.id });

    // Emit connection success
    client.emit("connected", { socketId: client.id });
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo?.familyId) {
      // Notify others in the family that user left
      client.to(`family_${userInfo.familyId}`).emit("userLeft", {
        userId: client.id,
        username: userInfo.username,
        timestamp: new Date(),
      });
    }

    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage("demo")
  async testing(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    this.logger.log(`Testing : ${data}`);
    this.server.emit("onTesting", {
      res: {
        success: true,
        message: "Socket getaway working properly",
        data: `{2**3 + 4**4} | ${2 ** 3 + 4 ** 4}`,
      },
    });
    client.emit("onTesting", {
      res: {
        success: true,
        message: "Message sent successfully.",
        data,
      },
    });
  }

  @SubscribeMessage("joinFamily")
  async handleJoinFamily(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomData
  ) {``
    try {
      this.logger.log(`User ${data.userId} joining family ${data.familyId}`);

      // Verify family exists
      const family = await this.familiesService.getFamilyByCode(data.familyId);
      if (!family) {
        client.emit("error", { message: "Family not found" });
        return;
      }

      // Leave previous room if any
      const userInfo = this.connectedUsers.get(client.id);
      if (userInfo?.familyId) {
        client.leave(`family_${userInfo.familyId}`);
      }

      // Join the family room
      await client.join(`family_${data.familyId}`);

      // Update user info
      this.connectedUsers.set(client.id, {
        socketId: client.id,
        familyId: data.familyId,
        username: data.username,
      });

      // Get recent messages for the family
      const recentMessages = await this.messagesService.getMessages(
        data.familyId,
        "50"
      );

      // Send recent messages to the user
      client.emit("recentMessages", {
        familyId: data.familyId,
        messages: recentMessages,
      });

      // Notify others in the family
      client.to(`family_${data.familyId}`).emit("userJoined", {
        userId: data.userId,
        username: data.username,
        timestamp: new Date(),
      });

      // Send success response
      client.emit("joinedFamily", {
        familyId: data.familyId,
        success: true,
      });
    } catch (error) {
      this.logger.error(`Error joining family: ${error.message}`);
      client.emit("error", { message: "Failed to join family" });
    }
  }

  @SubscribeMessage("leaveFamily")
  async handleLeaveFamily(@ConnectedSocket() client: Socket) {
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo?.familyId) {
      // Leave the room
      client.leave(`family_${userInfo.familyId}`);

      // Notify others
      client.to(`family_${userInfo.familyId}`).emit("userLeft", {
        userId: client.id,
        username: userInfo.username,
        timestamp: new Date(),
      });

      // Update user info
      this.connectedUsers.set(client.id, {
        socketId: client.id,
      });

      client.emit("leftFamily", { success: true });
    }
  }

  @SubscribeMessage("sendMessage")
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageData
  ) {
    try {
      const userInfo = this.connectedUsers.get(client.id);
      if (!userInfo?.familyId || userInfo.familyId !== data.familyId) {
        client.emit("error", { message: "Not joined to this family" });
        return;
      }

      // Save message to database
      const message = await this.messagesService.sendMessage({
        familyId: data.familyId,
        senderId: data.userId,
        content: data.content,
        senderName: data.username,
      });

      // Broadcast message to all users in the family
      this.server.to(`family_${data.familyId}`).emit("newMessage", {
        id: message.id,
        familyId: data.familyId,
        senderId: data.userId,
        senderName: data.username,
        content: data.content,
        timestamp: message.createdAt || new Date(),
      });
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      client.emit("error", { message: "Failed to send message" });
    }
  }

  @SubscribeMessage("typing")
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingData
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo?.familyId === data.familyId) {
      // Broadcast typing status to others in the family (not to sender)
      client.to(`family_${data.familyId}`).emit("userTyping", {
        userId: data.userId,
        username: data.username,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage("getFamilyMembers")
  async handleGetFamilyMembers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { familyId: string }
  ) {
    try {
      // Get all connected users in this family
      const familyRoom = this.server.sockets.adapter.rooms.get(
        `family_${data.familyId}`
      );
      const onlineUsers = [];

      if (familyRoom) {
        for (const socketId of familyRoom) {
          const userInfo = this.connectedUsers.get(socketId);
          if (userInfo) {
            onlineUsers.push({
              socketId: socketId,
              username: userInfo.username,
            });
          }
        }
      }

      client.emit("familyMembers", {
        familyId: data.familyId,
        onlineUsers,
        count: onlineUsers.length,
      });
    } catch (error) {
      this.logger.error(`Error getting family members: ${error.message}`);
      client.emit("error", { message: "Failed to get family members" });
    }
  }

  // Method to send notifications from other parts of the application
  async notifyFamilyMembers(familyId: string, event: string, data: any) {
    this.server.to(`family_${familyId}`).emit(event, data);
  }

  // Method to check if a family has active connections
  getFamilyConnectionCount(familyId: string): number {
    const familyRoom = this.server.sockets.adapter.rooms.get(
      `family_${familyId}`
    );
    return familyRoom ? familyRoom.size : 0;
  }
}
