import { InferSchemaType, Schema, model } from "mongoose";

const ratingSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "ExchangeSession", required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

ratingSchema.index({ sessionId: 1, fromUserId: 1, toUserId: 1 }, { unique: true });

export type RatingDoc = InferSchemaType<typeof ratingSchema> & { _id: Schema.Types.ObjectId };

export const RatingModel = model("Rating", ratingSchema);
