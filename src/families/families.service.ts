import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Family, FamilyDocument } from "./schemas/family.schema";
import { Member, MemberDocument } from "./schemas/member.schema";
import { CreateFamilyDto } from "./dto/create-family.dto";
import { JoinFamilyDto } from "./dto/join-family.dto";

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>
  ) {}

  private generateFamilyCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createFamily(createFamilyDto: CreateFamilyDto) {
    let code: string;
    let isUnique = false;

    // Generate unique code
    while (!isUnique) {
      code = this.generateFamilyCode();
      const existingFamily = await this.familyModel.findOne({ code });
      if (!existingFamily) {
        isUnique = true;
      }
    }

    // Create family
    const family = new this.familyModel({
      name: createFamilyDto.name,
      code,
      memberCount: 1,
    });

    const savedFamily = await family.save();

    // Add creator as first member
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

  async joinFamily(joinFamilyDto: JoinFamilyDto) {
    const family = await this.familyModel.findOne({ code: joinFamilyDto.code });
    if (!family) {
      throw new NotFoundException("Family not found");
    }

    // Check if username already exists in this family
    const existingMember = await this.memberModel.findOne({
      familyCode: joinFamilyDto.code,
      username: joinFamilyDto.username,
    });

    if (existingMember) {
      throw new ConflictException("Username already taken in this family");
    }

    // Add new member
    const member = new this.memberModel({
      username: joinFamilyDto.username,
      familyId: family._id,
      familyCode: joinFamilyDto.code,
    });

    await member.save();

    // Update member count
    await this.familyModel.findByIdAndUpdate(family._id, {
      $inc: { memberCount: 1 },
    });

    return {
      family,
      member,
    };
  }

  // Updated method to support WebSocket - can accept either code or familyId
  async getFamilyByCode(identifier: string) {
    // First try to find by code (for backward compatibility)
    let family = await this.familyModel.findOne({ code: identifier });

    // If not found by code, try by _id (for WebSocket which passes familyId)
    if (!family) {
      try {
        family = await this.familyModel.findById(identifier);
      } catch (error) {
        // Invalid ObjectId format
        throw new NotFoundException("Family not found");
      }
    }

    if (!family) {
      throw new NotFoundException("Family not found");
    }

    const members: any = await this.memberModel.find({
      $or: [{ familyCode: family.code }, { familyId: family._id }],
    });

    return {
      family,
      members: members.map((member) => ({
        id: member._id,
        username: member.username,
        joinedAt: (member as any).createdAt || new Date(),
      })),
    };
  }

  // New method specifically for WebSocket that returns family by ID
  async getFamilyById(familyId: string) {
    const family = await this.familyModel.findById(familyId);
    if (!family) {
      throw new NotFoundException("Family not found");
    }

    const members: any = await this.memberModel.find({ familyId });

    return {
      family,
      members: members.map((member) => ({
        id: member._id,
        username: member.username,
        joinedAt: (member as any).createdAt || new Date(),
      })),
    };
  }

  async verifyMember(memberId: string) {
    const member = await this.memberModel.findById(memberId);

    if (!member) {
      throw new NotFoundException("Member not found in this family");
    }

    return member;
  }

  // New method to verify member by userId and familyId (for WebSocket)
  async verifyMemberInFamily(userId: string, familyId: string) {
    const member = await this.memberModel.findOne({
      _id: userId,
      familyId: familyId,
    });

    if (!member) {
      throw new NotFoundException("Member not found in this family");
    }

    return member;
  }

  // New method to get member by username and family code/id
  async getMemberByUsername(username: string, familyIdentifier: string) {
    // Try by family code first
    let member = await this.memberModel.findOne({
      username,
      familyCode: familyIdentifier,
    });

    // If not found, try by familyId
    if (!member) {
      member = await this.memberModel.findOne({
        username,
        familyId: familyIdentifier,
      });
    }

    return member;
  }

  // Method to get all members of a family
  async getFamilyMembers(familyId: string) {
    console.log(
      "🪵 ~ FamiliesService ~ getFamilyMembers ~ familyId:",
      familyId
    );

    const members = await this.memberModel.find({ familyCode : familyId });
    return members.map((member) => ({
      id: member._id,
      username: member.username,
      joinedAt: (member as any).createdAt || new Date(),
    }));
  }
}
