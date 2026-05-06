import { InferSchemaType, Schema, model } from "mongoose";

export const SESSION_STATUS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"] as const;
export type SessionStatus = (typeof SESSION_STATUS)[number];

const exchangeSessionSchema = new Schema(
  {
    userAId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userBId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skillOffered: { type: String, required: true, trim: true },
    skillRequested: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: SESSION_STATUS, default: "PENDING" }
  },
  { timestamps: true }
);

export type ExchangeSessionDoc = InferSchemaType<typeof exchangeSessionSchema> & {
  _id: Schema.Types.ObjectId;
};

export const ExchangeSessionModel = model("ExchangeSession", exchangeSessionSchema);
