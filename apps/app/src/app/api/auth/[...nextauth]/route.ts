import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../../lib/db";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false; // Fail if no email

      try {
        // Ensure user exists or create one
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name || "Unknown",
            provider: "GOOGLE",
          },
          create: {
            email: user.email,
            name: user.name || "Unknown",
            provider: "GOOGLE",
          },
        });
      } catch (e) {
        console.error("Database error:", e);
        return false; // Return false to deny sign-in
      }
      return true; // Allow sign-in
    },
  }, // ✅ Missing comma added here
  session: {
    strategy: "jwt", // Use JWT for session handling
  },
});

export { handler as GET, handler as POST };
