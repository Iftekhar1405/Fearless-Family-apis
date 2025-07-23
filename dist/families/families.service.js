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
exports.FamiliesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const family_schema_1 = require("./schemas/family.schema");
const member_schema_1 = require("./schemas/member.schema");
let FamiliesService = class FamiliesService {
    constructor(familyModel, memberModel) {
        this.familyModel = familyModel;
        this.memberModel = memberModel;
    }
    generateFamilyCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    async createFamily(createFamilyDto) {
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = this.generateFamilyCode();
            const existingFamily = await this.familyModel.findOne({ code });
            if (!existingFamily) {
                isUnique = true;
            }
        }
        const family = new this.familyModel({
            name: createFamilyDto.name,
            code,
            memberCount: 1,
        });
        const savedFamily = await family.save();
        const member = new this.memberModel({
            username: createFamilyDto.username,
            familyId: savedFamily._id,
            familyCode: code,
        });
        await member.save();
        return {
            family: savedFamily,
            member,
        };
    }
    async joinFamily(joinFamilyDto) {
        const family = await this.familyModel.findOne({ code: joinFamilyDto.code });
        if (!family) {
            throw new common_1.NotFoundException('Family not found');
        }
        const existingMember = await this.memberModel.findOne({
            familyCode: joinFamilyDto.code,
            username: joinFamilyDto.username,
        });
        if (existingMember) {
            throw new common_1.ConflictException('Username already taken in this family');
        }
        const member = new this.memberModel({
            username: joinFamilyDto.username,
            familyId: family._id,
            familyCode: joinFamilyDto.code,
        });
        await member.save();
        await this.familyModel.findByIdAndUpdate(family._id, {
            $inc: { memberCount: 1 },
        });
        return {
            family,
            member,
        };
    }
    async getFamilyByCode(code) {
        const family = await this.familyModel.findOne({ code });
        if (!family) {
            throw new common_1.NotFoundException('Family not found');
        }
        const members = await this.memberModel.find({ familyCode: code });
        return {
            family,
            members: members.map(member => ({
                username: member.username,
                joinedAt: member.createdAt,
            })),
        };
    }
    async verifyMember(memberId) {
        const member = await this.memberModel.findById(memberId);
        if (!member) {
            throw new common_1.NotFoundException('Member not found in this family');
        }
        return member;
    }
};
exports.FamiliesService = FamiliesService;
exports.FamiliesService = FamiliesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(family_schema_1.Family.name)),
    __param(1, (0, mongoose_1.InjectModel)(member_schema_1.Member.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], FamiliesService);
//# sourceMappingURL=families.service.js.map