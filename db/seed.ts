import { db } from "./client";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    // Check if test user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "test@example.com"))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("✅ Test user already exists");
      return;
    }

    // Insert test user (password should be hashed in production)
    const result = await db
      .insert(users)
      .values({
        name: "Test User",
        email: "test@example.com",
        password: "hashed_password_123", // In production, use bcrypt or similar
      })
      .returning();

    console.log("✅ Test user created successfully:", result);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
