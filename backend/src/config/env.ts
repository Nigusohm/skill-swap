import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_SECRET"] as const;
const weakJwtSecrets = new Set(["change_this_to_a_strong_secret_key", "secret", "password", "123456"]);

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(
      ", "
    )}. Set them in Render Dashboard -> Service -> Environment, then redeploy.`
  );
}

const jwtSecret = process.env.JWT_SECRET as string;
if (jwtSecret.length < 24 || weakJwtSecrets.has(jwtSecret.trim().toLowerCase())) {
  throw new Error("JWT_SECRET is too weak. Use a random secret with at least 24 characters.");
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret,
  clientUrl: process.env.CLIENT_URL ?? "*"
};
