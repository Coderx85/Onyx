import { db } from "@/db/client";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

// Note: Better Auth handles user creation and authentication
// These are example queries for custom use cases

// Example: Find user by email
export async function findUserByEmail(email: string) {
  return db.select().from(user).where(eq(user.email, email)).limit(1);
}

// Example: Get user by ID
export async function getUserById(id: string) {
  return db.select().from(user).where(eq(user.id, id)).limit(1);
}

// Example: Get all user (be careful with this!)
export async function getAlluser() {
  return db.select().from(user);
}

// Example: Update user
export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string }>
) {
  return db.update(user).set(data).where(eq(user.id, id)).returning();
}

// Example: Delete user
export async function deleteUser(id: string) {
  return db.delete(user).where(eq(user.id, id)).returning();
}
