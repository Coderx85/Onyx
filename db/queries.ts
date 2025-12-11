import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Example: Sign Up
export async function signUpUser(
  name: string,
  email: string,
  hashedPassword: string
) {
  return db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning();
}

// Example: Login
export async function findUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).limit(1);
}

// Example: Get user by ID
export async function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).limit(1);
}

// Example: Update user
export async function updateUser(
  id: number,
  data: Partial<{ name: string; email: string; password: string }>
) {
  return db.update(users).set(data).where(eq(users.id, id)).returning();
}

// Example: Delete user
export async function deleteUser(id: number) {
  return db.delete(users).where(eq(users.id, id)).returning();
}
