import { Model } from 'mongoose';
import { Family, FamilyDocument } from './schemas/family.schema';
import { Member, MemberDocument } from './schemas/member.schema';
import { CreateFamilyDto } from './dto/create-family.dto';
import { JoinFamilyDto } from './dto/join-family.dto';
export declare class FamiliesService {
    private familyModel;
    private memberModel;
    constructor(familyModel: Model<FamilyDocument>, memberModel: Model<MemberDocument>);
    private generateFamilyCode;
    createFamily(createFamilyDto: CreateFamilyDto): Promise<{
        family: import("mongoose").Document<unknown, {}, FamilyDocument> & Family & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        member: import("mongoose").Document<unknown, {}, MemberDocument> & Member & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    joinFamily(joinFamilyDto: JoinFamilyDto): Promise<{
        family: import("mongoose").Document<unknown, {}, FamilyDocument> & Family & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        member: import("mongoose").Document<unknown, {}, MemberDocument> & Member & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    getFamilyByCode(code: string): Promise<{
        family: import("mongoose").Document<unknown, {}, FamilyDocument> & Family & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        members: any;
    }>;
    verifyMember(memberId: string): Promise<import("mongoose").Document<unknown, {}, MemberDocument> & Member & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
