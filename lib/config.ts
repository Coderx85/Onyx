import { NewUser } from "@/types/Tdb";

export const dummyUser: NewUser = {
  id: "userId",
  name: "Test User",
  email: "test@example.com",
  password: "test@123",
  confirmPassword: "test@123",
};

export const config = {
  NODE_ENV: process.env.NODE_ENV,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  database: process.env.DATABASE_URL,
  dummyUser,
};
