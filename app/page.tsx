import React from "react";
import { UserProfile } from "@/components/user-profile";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome</h1>
          <p className="text-gray-600 mb-8">
            Better Auth setup with email & password authentication
          </p>

          <div className="border-t pt-8">
            <UserProfile />
          </div>
        </div>
      </div>
    </main>
  );
}
