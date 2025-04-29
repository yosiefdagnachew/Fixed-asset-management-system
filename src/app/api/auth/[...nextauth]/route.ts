import React from 'react';
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import NextAuth from "next-auth/next";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials", 
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Login attempt:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error("Invalid credentials");
        }
      
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });
        console.log("User from DB:", user);
      
        if (!user || !user?.password) {
          console.log("User not found or missing password");
          throw new Error("Invalid credentials");
        }
      
        const isCorrectPassword = await compare(
          credentials.password,
          user.password
        );
        console.log("Password valid:", isCorrectPassword);
      
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }
      
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.email = user.email ?? "";
        token.role = user.role ?? "";
        token.name = user.name ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          role: token.role,
        },
      };
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 