import { InferSchemaType, Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

export type MessageDoc = InferSchemaType<typeof messageSchema> & { _id: Schema.Types.ObjectId };

export const MessageModel = model("Message", messageSchema);
