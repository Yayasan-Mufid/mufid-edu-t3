import moment from 'moment'
import { z } from 'zod'
import type { User } from '@prisma/client'
import { toZod } from 'tozod'
import { procedure, router } from '../trpc'
import { createPassword } from '@/lib/password'
//import prisma from '@/lib/prisma'
import {
  UserUpdateOneSchema,
  UserFindManySchema,
  UserFindFirstSchema,
  UserRoleFindManySchema,
} from '@/prisma/generated/schemas'
import { TRPCError } from '@trpc/server'
import { isAdmin, isClassAdmin, isModuleAdmin } from '../utils/middlewares'
import { isClassAdmin as checkClassAdmin } from '../utils/role-checker'

type MinimalUser = Omit<User, 'password' | 'otp' | 'otp_expired' | 'image'>

const userSchema: toZod<MinimalUser> = z.object({
  id: z.string(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  gender: z.string().nullable(),
  phone_number: z.string().nullable(),
  wa_number: z.string().nullable(),
  date_of_birth: z.date().nullable(),
  place_of_birth: z.string().nullable(),
  email: z.string().nullable(),
  profile_picture: z.string().url().nullable(),
  emailVerified: z.date().nullable(),
  telegram_id: z.string().nullable(),
  username: z.string().nullable(),
  mandatory_filled: z.boolean(),
  suspended: z.boolean(),
})

const getUsers = procedure
  .use(isClassAdmin)
  .input(z.object({
    filter: z.string().nullable(),
    pageSize: z.number().int(),
    cursor: z.string().nullish(),
    direction: z.literal('asc').or(z.literal('desc'))
  }))
  .output(z.object({
    data: z.array(userSchema.passthrough()).nullable(),
    nextPageCursor: z.string().nullable()
  }))
  .query(async function({ input, ctx }) {
    const result = await ctx.prisma.user.findMany({
      where: input.filter ? {
        OR: [
          { name: { contains: input.filter }},
          { address: { contains: input.filter }},
          { email: { contains: input.filter }},
          { username: { contains: input.filter }},
        ]
      } : undefined,
      orderBy: {
        name: input.direction
      },
      take: input.pageSize + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined
    })
    if (result) {
      const parsed = z.array(userSchema).safeParse(result)
      if (!parsed.success) {
        console.log(parsed.error.issues)
      }
      if (result.length === input.pageSize + 1) {
        const [nextCursor, ...data] = result.reverse()
        return {
          data: data.reverse(),
          nextPageCursor: nextCursor.id
        }
      }
      return {
        data: result,
        nextPageCursor: null
      }
    }
    return {
      data: null,
      nextPageCursor: null
    }
  })

const getUsersWithRole = procedure
  .use(isModuleAdmin)
  .input(UserRoleFindManySchema)
  .query(async function({ input, ctx }) {
    return await ctx.prisma.userRole.findMany(input)
  })

const checkUserExist = procedure
  .input(z.string())
  .mutation(async function({ input, ctx }) {
    const user = await ctx.prisma.user.findUnique({ where: { email: input }})
    if (user) return true
    return false
  })

const getUser = procedure
  .input(UserFindFirstSchema)
  .query(async function({ input, ctx }) {
    const user = await ctx.prisma.user.findFirst(input)
    if (user) {
      if (!checkClassAdmin(ctx) && user.id !== ctx.userId) throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Unauthorized access to user profile'
      })
      return user
    }
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User does not exist'
    })
  })

const updateProfile = procedure
  .input(UserUpdateOneSchema)
  .mutation(async function({ input, ctx }) {
    if (ctx.userId !== input.data.id) throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Profile update only allowed by the user itself'
    })
  })

const assignRoleToUsers = procedure
  .use(isAdmin)
  .input(z.object({
    user_ids: z.string().array(),
    role: z.string()
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.userRole.createMany({
      data: input.user_ids.map(function(id) {
        return {
          user_id: id,
          role_name: input.role
        }
      }),
      skipDuplicates: true
    })
  })

const removeRoleFromUsers = procedure
  .use(isAdmin)
  .input(z.object({
    user_ids: z.string().array(),
    role: z.string()
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.userRole.deleteMany({
      where: {
        user_id: {
          in: input.user_ids
        },
        role_name: input.role
      }
    })
  })

const deleteUsers = procedure
  .use(isAdmin)
  .input(z.object({
    user_ids: z.string().array()
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.user.deleteMany({
      where: {
        id: {
          in: input.user_ids
        }
      }
    })
  })

const registerUser = procedure
  .input(z.object({
    name: z.string().refine(function(v: string) { return v.length > 2 }, { message: 'Too short' }),
    gender: z.literal('MALE').or(z.literal('FEMALE')),
    email: z.string().email(),
    date_of_birth: z.string().datetime().transform(function(v) { return moment(v).toDate() }),
    place_of_birth: z.string(),
    address: z.string(),
    phone_number: z.string(),
    password: z.string()
  }))
  .mutation(async function({ input, ctx }) {
    const existing = await ctx.prisma.user.findFirst({ where: { email: input.email }})
    if (existing) throw new TRPCError({
      code: 'CONFLICT',
      message: `A user with e-mail: ${input.email} already exists`
    })
    const { password, ...rest } = input
    const encrypted = await createPassword(password)
    return await ctx.prisma.user.create({ data: { ...rest, password: encrypted }, select: { email: true }})
  })

const userRouter = router({
  getUsers,
  getUser,
  updateProfile,
  assignRoleToUsers,
  removeRoleFromUsers,
  deleteUsers,
  getUsersWithRole,
  registerUser,
  checkUserExist
})

export default userRouter