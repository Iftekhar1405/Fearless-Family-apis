import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    sendMessage(sendMessageDto: SendMessageDto): Promise<{
        id: any;
        content: any;
        timestamp: any;
    }>;
    getMessages(familyCode: string, memberId: string): Promise<any>;
}
