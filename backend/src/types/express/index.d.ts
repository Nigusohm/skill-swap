import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface UserTokenPayload extends JwtPayload {
      userId: string;
      email: string;
    }

    interface Request {
      user?: UserTokenPayload;
    }
  }
}

export {};
