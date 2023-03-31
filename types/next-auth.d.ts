import NextAuth, { type DefaultSession } from "next-auth";
import type { JWT } from 'next-auth/jwt'

export type Roles = 'ADMIN' | 'TREASURER' | 'STAFF' | 'PROGRAM_ADMIN' | 'MODULE_ADMIN' | 'CLASS_ADMIN' | 'STUDENT'

declare module "next-auth" {

  export type Roles = Roles

  export interface Session {
    user: {
      id: string,
      role: Roles,
      gender: 'MALE' | 'FEMALE'
    } & DefaultSession['user']
  }
}

declare module "next-auth/jwt" {
  export interface JWT {
    role: Roles,
    userId: string,
  }
}