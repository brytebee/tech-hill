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

import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";

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
        const updateResult = await UserService.updateLastLogin(user.id);

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          tokenVersion: updateResult.tokenVersion,
        };
      },
    }),
    CredentialsProvider({
      id: "passkey",
      name: "Passkey",
      credentials: {
        email: { label: "Email", type: "email" },
        response: { label: "Response", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.response) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user) return null;
        
        const cookieStore = await cookies();
        // @ts-ignore
        const expectedChallenge = cookieStore.get("webauthn_auth_challenge")?.value;
        if (!expectedChallenge) throw new Error("Missing Passkey Challenge (Session may have expired)");

        let authResponse;
        try {
          authResponse = JSON.parse(credentials.response);
        } catch (e) {
          throw new Error("Invalid passkey response payload");
        }
        
        const passkey = await prisma.passkeyCredential.findUnique({
          where: { credentialID: authResponse.id },
        });

        if (!passkey || passkey.userId !== user.id) {
          throw new Error("Passkey is not associated with this account.");
        }

        const rpID = process.env.NEXT_PUBLIC_APP_URL 
          ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname 
          : "localhost";
        const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        let verification;
        try {
          verification = await verifyAuthenticationResponse({
            response: authResponse,
            expectedChallenge,
            expectedOrigin,
            expectedRPID: rpID,
            credential: {
              id: passkey.credentialID, // already a base64url string
              publicKey: new Uint8Array(passkey.publicKey),
              counter: Number(passkey.counter),
              transports: passkey.transports ? JSON.parse(passkey.transports) : undefined,
            },
          });
        } catch (error) {
          console.error("Passkey validation failed:", error);
          throw new Error("Passkey cryptographic signature invalid.");
        }

        if (verification.verified) {
          await prisma.passkeyCredential.update({
            where: { id: passkey.id },
            data: { counter: BigInt(verification.authenticationInfo.newCounter) },
          });

          if (user.status !== "ACTIVE") {
            throw new Error("Account is suspended or inactive");
          }

          const updateResult = await UserService.updateLastLogin(user.id);

          // Clear challenge
          // @ts-ignore
          cookieStore.delete("webauthn_auth_challenge");

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            tokenVersion: updateResult.tokenVersion,
          };
        }

        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.status = user.status;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.version = user.tokenVersion;
      }

      // ⚡️ SECURITY: Single Device Check with 2-Minute Cache
      // To prevent a DB query on every request, we cache the validation for 2 minutes.
      const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
      const now = Date.now();

      if (token.sub && (!token.lastChecked || (now - (token.lastChecked as number)) > CACHE_TTL)) {
        const validationData = await UserService.getUserSessionValidationData(token.sub);
        
        // If user deleted or missing
        if (!validationData) {
          return { ...token, error: "SessionExpired" };
        }

        // If user logged in elsewhere (token versions do not match)
        if (validationData.tokenVersion !== token.version) {
          return { ...token, error: "SessionExpired" };
        }

        // If user is suspended
        if (validationData.status !== "ACTIVE") {
          return { ...token, error: "SessionExpired" };
        }

        // Sync role, status, and subscription if they changed mid-session
        token.role = validationData.role;
        token.status = validationData.status;
        token.hasActiveSubscription = validationData.hasActiveSubscription;

        // Update the cache timestamp
        token.lastChecked = now;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "SessionExpired") {
        // Return null or invalid session to force logout on client
        return null as any;
      }

      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.hasActiveSubscription = token.hasActiveSubscription as boolean | undefined;
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
    maxAge: 1 * 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
};
