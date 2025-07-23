"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const families_service_1 = require("../families/families.service");
let MessagesService = class MessagesService {
    constructor(messageModel, familiesService) {
        this.messageModel = messageModel;
        this.familiesService = familiesService;
    }
    async sendMessage(sendMessageDto) {
        const member = await this.familiesService.verifyMember(sendMessageDto.memberId);
        const message = new this.messageModel({
            content: sendMessageDto.content,
            familyId: member.familyId,
            familyCode: sendMessageDto.familyCode,
        });
        return message.save();
    }
    async getMessages(familyCode, memberId) {
        await this.familiesService.verifyMember(memberId);
        const messages = await this.messageModel
            .find({ familyCode })
            .sort({ createdAt: 1 })
            .limit(100);
        return messages.map(message => ({
            id: message._id,
            content: message.content,
            timestamp: message.createdAt,
        }));
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        families_service_1.FamiliesService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map