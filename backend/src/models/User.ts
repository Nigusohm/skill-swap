import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    school: { type: String, default: "" },
    bio: { type: String, default: "" },
    availability: { type: String, default: "" },
    skillsToTeach: [{ type: String, trim: true }],
    skillsToLearn: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };

export const UserModel = model("User", userSchema);
