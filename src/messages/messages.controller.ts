import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    const message:any = await this.messagesService.sendMessage(sendMessageDto);
    return {
      id: message._id,
      content: message.content,
      timestamp: message.createdAt,
    };
  }

  @Get()
  async getMessages(
    @Query('familyCode') familyCode: string,
    @Query('memberId') memberId: string,
  ) {
    return this.messagesService.getMessages(familyCode, memberId);
  }
}