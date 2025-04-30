// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { compare } from "bcryptjs";
// import { prisma } from "./prisma";
// import { Role } from "@/types/auth";

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/login",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         const user = await prisma.user.findUnique({
//           where: {
//             email: credentials.email,
//           },
//         });

//         if (!user) {
//           return null;
//         }

//         const isPasswordValid = await compare(credentials.password, user.password);

//         if (!isPasswordValid) {
//           return null;
//         }

//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//           role: user.role as Role,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ token, session }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.name = token.name;
//         session.user.email = token.email;
//         session.user.role = token.role as Role;
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       const dbUser = await prisma.user.findFirst({
//         where: {
//           email: token.email,
//         },
//       });

//       if (!dbUser) {
//         if (user) {
//           token.id = user?.id;
//           token.role = user?.role;
//         }
//         return token;
//       }

//       return {
//         id: dbUser.id,
//         name: dbUser.name,
//         email: dbUser.email,
//         role: dbUser.role as Role,
//       };
//     },
//   },
// }; 