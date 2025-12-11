import { dummyUser } from "@/lib";
import { db } from "./client";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    // Check if test user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, dummyUser.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("✅ Test user already exists");
      return;
    }

    // Insert test user (password should be hashed in production)
    const result = await db.insert(users).values(dummyUser).returning();

    console.log("✅ Test user created successfully:", result);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
