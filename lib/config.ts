import { NewUser } from "@/types/Tdb";

export const dummyUser: NewUser = {
  name: "Test User",
  email: "test@example.com",
  password: "test@123",
  confirmPassword: "test@123",
};

export const config = {
  jwt_secret: process.env.JWT_SECRET,
  database: process.env.DATABASE_URL,
  dummyUser,
};
