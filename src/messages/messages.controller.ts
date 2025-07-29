import { Controller, Post, Get, Body, Query, Param, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    const message: any = await this.messagesService.sendMessage(sendMessageDto);
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

  // New endpoint for paginated messages
  @Get(':familyId/paginated')
  async getMessagesPaginated(
    @Param('familyId') familyId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.messagesService.getMessagesPaginated(
      familyId,
      parseInt(page, 10),
      parseInt(limit, 10)
    );
  }

  // New endpoint to delete a message
  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Body('userId') userId: string,
  ) {
    return this.messagesService.deleteMessage(messageId, userId);
  }
}