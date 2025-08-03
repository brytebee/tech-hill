// import { NextAuthOptions } from 'next-auth'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import bcrypt from 'bcryptjs'
// import { db } from './db'
// import { UserRole, UserStatus } from '@prisma/client'

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(db),
//   providers: [
//     CredentialsProvider({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email' },
//         password: { label: 'Password', type: 'password' }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error('Email and password are required')
//         }

//         const user = await db.user.findUnique({
//           where: {
//             email: credentials.email.toLowerCase()
//           }
//         })

//         if (!user) {
//           throw new Error('No user found with this email')
//         }

//         // Check if user is active
//         if (user.status !== 'ACTIVE') {
//           throw new Error(`Account is ${user.status.toLowerCase()}. Please contact support.`)
//         }

//         const isPasswordValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         )

//         if (!isPasswordValid) {
//           throw new Error('Invalid password')
//         }

//         // Update last login
//         await db.user.update({
//           where: { id: user.id },
//           data: { lastLoginAt: new Date() }
//         })

//         return {
//           id: user.id,
//           email: user.email,
//           name: `${user.firstName} ${user.lastName}`,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           role: user.role,
//           status: user.status,
//           profileImage: user.profileImage,
//         }
//       }
//     })
//   ],
//   session: {
//     strategy: 'jwt',
//     maxAge: 24 * 60 * 60, // 24 hours
//   },
//   callbacks: {
//     async jwt({ token, user, trigger, session }) {
//       if (user) {
//         token.role = user.role
//         token.status = user.status
//         token.firstName = user.firstName
//         token.lastName = user.lastName
//         token.profileImage = user.profileImage
//       }

//       // Handle session updates
//       if (trigger === 'update' && session) {
//         token.firstName = session.firstName
//         token.lastName = session.lastName
//         token.profileImage = session.profileImage
//       }

//       return token
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.sub!
//         session.user.role = token.role as UserRole
//         session.user.status = token.status as UserStatus
//         session.user.firstName = token.firstName as string
//         session.user.lastName = token.lastName as string
//         session.user.profileImage = token.profileImage as string | null
//         session.user.name = `${token.firstName} ${token.lastName}`
//       }
//       return session
//     },
//     async redirect({ url, baseUrl }) {
//       // Always redirect to dashboard after sign in
//       // The middleware will handle role-based routing
//       if (url.startsWith("/")) return url
//       else if (new URL(url).origin === baseUrl) return url
//       return baseUrl + "/dashboard"
//     }
//   },
//   pages: {
//     signIn: '/login',
//     error: '/auth/error'
//   },
//   events: {
//     async signOut({ token }) {
//       // Log user activity
//       console.log(`User ${token.sub} signed out at ${new Date().toISOString()}`)
//     }
//   }
// }

// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { UserService } from "@/lib/services/userService";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await UserService.getUserByEmail(credentials.email);

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account is suspended or inactive");
        }

        // Update last login
        await UserService.updateLastLogin(user.id);

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.status = user.status;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
