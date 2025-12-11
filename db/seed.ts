import { auth } from "@/auth";
import { db } from "./client";
import { user } from "./schema";
import { eq } from "drizzle-orm";
import { dummyUser } from "@/lib/config";

async function seed() {
  try {
    // Check if test user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, dummyUser.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("✅ Test user already exists");
      return;
    }

    // Use better-auth API to create user with proper password hashing
    const result = await auth.api.signUpEmail({
      body: {
        email: dummyUser.email,
        password: dummyUser.password,
        name: dummyUser.name,
      },
    });

    console.log("✅ Test user created successfully:", result.user);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
