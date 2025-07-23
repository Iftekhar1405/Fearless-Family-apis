import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { FamiliesService } from '../families/families.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private familiesService: FamiliesService,
  ) {}

  async sendMessage(sendMessageDto: SendMessageDto) {
    // Verify that the user is a member of the family
    const member = await this.familiesService.verifyMember(sendMessageDto.memberId    );

    // Create anonymous message (no sender information stored)
    const message = new this.messageModel({
      content: sendMessageDto.content,
      familyId: member.familyId,
      familyCode: sendMessageDto.familyCode,
    });

    return message.save();
  }

  async getMessages(familyCode: string, memberId: string) {
    // Verify that the user is a member of the family
    await this.familiesService.verifyMember( memberId);

    // Return messages without sender information
    const messages:any = await this.messageModel
      .find({ familyCode })
      .sort({ createdAt: 1 })
      .limit(100);

    return messages.map(message => ({
      id: message._id,
      content: message.content,
      timestamp: message.createdAt,
      // No sender information to maintain anonymity
    }));
  }
}