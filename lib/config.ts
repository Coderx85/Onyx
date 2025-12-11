import { users } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

const inserUserSchema = createInsertSchema(users);

type NewUser = z.infer<typeof inserUserSchema>;

export const dummyUser: NewUser = {
  name: "Test User",
  email: "test@example.com",
  password: "test@123",
};

export const config = {
  jwt_secret: process.env.JWT_SECRET,
  database: process.env.DATABASE_URL,
  dummyUser,
};
