import { InferSchemaType, Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    chatKey: { type: String, required: true, unique: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }]
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });

export type ChatDoc = InferSchemaType<typeof chatSchema> & { _id: Schema.Types.ObjectId };

export const ChatModel = model("Chat", chatSchema);
