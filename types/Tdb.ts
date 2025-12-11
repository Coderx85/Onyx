import { users } from "@/db/schema";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

// User input schemas
const inserUserSchema = createInsertSchema(users, {
  email: z.string().regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(100),
})
  .extend({
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NewUser = z.infer<typeof inserUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
