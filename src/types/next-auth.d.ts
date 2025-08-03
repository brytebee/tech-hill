import { UserRole, UserStatus } from '@prisma/client'
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      status: UserStatus
      firstName: string
      lastName: string
      profileImage?: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: UserRole
    status: UserStatus
    firstName: string
    lastName: string
    profileImage?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: UserRole
    status: UserStatus
    firstName: string
    lastName: string
    profileImage?: string | null
  }
}