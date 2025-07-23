import { Document } from 'mongoose';
export type FamilyDocument = Family & Document;
export declare class Family {
    name: string;
    code: string;
    memberCount: number;
}
export declare const FamilySchema: import("mongoose").Schema<Family, import("mongoose").Model<Family, any, any, any, Document<unknown, any, Family> & Family & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Family, Document<unknown, {}, import("mongoose").FlatRecord<Family>> & import("mongoose").FlatRecord<Family> & {
    _id: import("mongoose").Types.ObjectId;
}>;
