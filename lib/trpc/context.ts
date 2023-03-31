import { inferAsyncReturnType } from '@trpc/server'
import type { NextApiRequest } from 'next'
import type { PrismaClient } from '@prisma/client'
import type { Roles } from 'next-auth'
import { getToken } from 'next-auth/jwt'
// import { authOptions } from 'pages/api/auth/[...nextauth]'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
// import { getServerSession } from 'next-auth/next'
import prisma from '../prisma'


export async function createContext(opt: CreateNextContextOptions): Promise<{
  email: string | null | undefined,
  role: Roles | null | undefined,
  name: string | null | undefined,
  userId: string | null | undefined,
  prisma: PrismaClient,
  tokenTxt: string | null | undefined,
  req: NextApiRequest
}> {
  const token = await getToken({ req: opt.req })
  // console.log({ token })
  // const session = await getServerSession(opt.req, opt.res, authOptions)
  return {
    email: token?.email,
    role: token?.role,
    name: token?.name,
    userId: token?.userId,
    prisma,
    tokenTxt: '',
    req: opt.req
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
