import mongoose from "mongoose";
import { env } from "../config/env";

export const connectMongo = async (): Promise<void> => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 10000
      });
      // eslint-disable-next-line no-console
      console.log("MongoDB connected");
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(`Failed to connect to MongoDB after ${maxAttempts} attempts`);
      }

      // eslint-disable-next-line no-console
      console.warn(`MongoDB connection attempt ${attempt}/${maxAttempts} failed. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
};
