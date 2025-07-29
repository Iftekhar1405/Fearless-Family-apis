import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { FamiliesService } from '../families/families.service';
import { SendMessageDto } from './dto/send-message.dto';

// Interface for WebSocket message data
interface WebSocketMessageData {
  familyId: string;
  senderId: string;
  content: string;
  senderName?: string;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private familiesService: FamiliesService,
  ) {}

  // Original method for REST API
  async sendMessage(sendMessageDto: SendMessageDto | WebSocketMessageData) {
    let member;
    let familyId;
    let familyCode;

    // Check if it's WebSocket data or REST API data
    if ('familyId' in sendMessageDto && 'senderId' in sendMessageDto) {
      // WebSocket format
      const wsData = sendMessageDto as WebSocketMessageData;
      
      // Verify member exists in the family
      member = await this.familiesService.verifyMemberInFamily(
        wsData.senderId, 
        wsData.familyId
      );
      
      familyId = wsData.familyId;
      
      // Get family code from the family
      const familyData = await this.familiesService.getFamilyById(wsData.familyId);
      familyCode = familyData.family.code;
      
      // Create message with sender info for WebSocket
      const message = new this.messageModel({
        content: wsData.content,
        familyId: familyId,
        familyCode: familyCode,
        senderId: wsData.senderId,
        senderName: wsData.senderName || member.username,
        createdAt: new Date(),
      });

      return message.save();
      
    } else {
      // REST API format (original)
      const restData = sendMessageDto as SendMessageDto;
      
      // Verify that the user is a member of the family
      member = await this.familiesService.verifyMember(restData.memberId);

      // Create anonymous message (no sender information stored)
      const message = new this.messageModel({
        content: restData.content,
        familyId: member.familyId,
        familyCode: restData.familyCode,
        createdAt: new Date(),
      });

      return message.save();
    }
  }

  // Updated method to support both REST API and WebSocket calls
  async getMessages(familyCodeOrId: string, memberIdOrLimit?: string) {
    // If memberIdOrLimit is a number string, treat it as limit (WebSocket call)
    if (memberIdOrLimit && /^\d+$/.test(memberIdOrLimit)) {
      const limit = parseInt(memberIdOrLimit, 10);
      
      // This is a WebSocket call - familyCodeOrId is familyId
      const messages: any = await this.messageModel
        .find({ familyId: familyCodeOrId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      // Return in reverse order (oldest first) with sender info
      return messages.reverse().map(message => ({
        id: message._id,
        content: message.content,
        timestamp: message.createdAt,
        senderId: message.senderId,
        senderName: message.senderName,
        familyId: message.familyId,
      }));
    } else {
      // This is a REST API call - original functionality
      const memberId = memberIdOrLimit;
      
      // Verify that the user is a member of the family
      await this.familiesService.verifyMember(memberId);

      // Return messages without sender information (anonymous)
      const messages: any = await this.messageModel
        .find({ familyCode: familyCodeOrId })
        .sort({ createdAt: 1 })
        .limit(100)
        .exec();

      return messages.map(message => ({
        id: message._id,
        content: message.content,
        timestamp: message.createdAt,
        // No sender information to maintain anonymity
      }));
    }
  }

  // New method specifically for WebSocket to get recent messages
  async getRecentMessages(familyId: string, limit: number = 50) {
    const messages: any = await this.messageModel
      .find({ familyId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // Return in reverse order (oldest first)
    return messages.reverse().map(message => ({
      id: message._id,
      content: message.content,
      timestamp: message.createdAt,
      senderId: message.senderId,
      senderName: message.senderName,
      familyId: message.familyId,
    }));
  }

  // Method to get message count for a family
  async getMessageCount(familyId: string): Promise<number> {
    return this.messageModel.countDocuments({ familyId });
  }

  // Method to delete a message (if needed)
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageModel.findById(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    // Only allow sender to delete their own message
    // Convert ObjectId to string for comparison
    if (message.senderId && message.senderId.toString() !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    return this.messageModel.findByIdAndDelete(messageId);
  }

  // Method to get messages with pagination
  async getMessagesPaginated(
    familyId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    
    const messages: any = await this.messageModel
      .find({ familyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.messageModel.countDocuments({ familyId });

    return {
      messages: messages.reverse().map(message => ({
        id: message._id,
        content: message.content,
        timestamp: message.createdAt,
        senderId: message.senderId,
        senderName: message.senderName,
        familyId: message.familyId,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }
}