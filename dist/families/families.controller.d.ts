import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { JoinFamilyDto } from './dto/join-family.dto';
import { FamilyDocument } from './schemas/family.schema';
export declare class FamiliesController {
    private readonly familiesService;
    constructor(familiesService: FamiliesService);
    createFamily(createFamilyDto: CreateFamilyDto): Promise<{
        family: import("mongoose").Document<unknown, {}, FamilyDocument> & import("./schemas/family.schema").Family & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        member: import("mongoose").Document<unknown, {}, import("./schemas/member.schema").MemberDocument> & import("./schemas/member.schema").Member & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    joinFamily(joinFamilyDto: JoinFamilyDto): Promise<{
        family: import("mongoose").Document<unknown, {}, FamilyDocument> & import("./schemas/family.schema").Family & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        member: import("mongoose").Document<unknown, {}, import("./schemas/member.schema").MemberDocument> & import("./schemas/member.schema").Member & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    getFamilyByCode(code: string): Promise<{
        family: import("mongoose").Document<unknown, {}, FamilyDocument> & import("./schemas/family.schema").Family & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        members: any;
    }>;
}
