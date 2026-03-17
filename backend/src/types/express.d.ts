declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "STUDENT" | "STAFF" | "ADMIN";
        email: string;
      };
    }
  }
}

export {};
