import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { FamiliesService } from '../families/families.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesService {
    private messageModel;
    private familiesService;
    constructor(messageModel: Model<MessageDocument>, familiesService: FamiliesService);
    sendMessage(sendMessageDto: SendMessageDto): Promise<import("mongoose").Document<unknown, {}, MessageDocument> & Message & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    getMessages(familyCode: string, memberId: string): Promise<any>;
}
