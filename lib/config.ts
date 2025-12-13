import { NewUser } from "@/types/Tdb";

export const dummyUser: NewUser = {
  id: "userId",
  name: "Test User",
  email: "test@example.com",
  password: "test@123",
  confirmPassword: "test@123",
};

export const config = {
  betterAuthSecret: process.env.BETTER_AUTH_SECRET || "your-secret-key",
  database:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/dbname",
  dummyUser,
  lokiURL: process.env.LOKI_URL || "http://localhost:3100",
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
