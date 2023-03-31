import { z } from 'zod'
import { TRPCError } from '@trpc/server'
//import prisma from '@/lib/prisma'
import { procedure, router } from '../trpc'
import { isAdmin, isProgramAdmin } from '../utils/middlewares'
import { isProgramAdmin as checkProgramAdmin } from '../utils/role-checker'
import { ProgramFindManySchema } from '@/prisma/generated/schemas/findManyProgram.schema'
import { Context } from '../context'


async function upsertProgramAdmin(adminIds: string[], programId: string, ctx: Context) {
  return adminIds.reduce(function(prevPromise, curr) {
    return prevPromise.then(function({ id }) {
      return ctx.prisma.programAdmin.upsert({
        create: {
          assigned_at: new Date(),
          program_id: programId,
          user_id: curr
        },
        update: {
          program_id: programId,
          user_id: curr
        },
        where: {
          user_id_program_id: {
            program_id: programId,
            user_id: curr
          }
        },
        select: { id: true }
      })
    })
    .catch(function(e) {
      return Promise.resolve({ id: '' })
    })
  }, Promise.resolve({ id: '' }))
}

const getPrograms = procedure
  .input(ProgramFindManySchema)
  .query(async function({ input, ctx }) {
    let unauthorizedOpt: z.infer<typeof ProgramFindManySchema> = {
      where: {
        published: {
          lte: new Date()
        }
      }
    }
    const authorized: boolean = ctx.role === 'ADMIN' || ctx.role === 'PROGRAM_ADMIN'
    const opt: z.infer<typeof ProgramFindManySchema> = authorized ? input : unauthorizedOpt
    return await ctx.prisma.program.findMany(opt)
  })

const getProgram = procedure
  .input(z.string())
  .query(async function({ input, ctx }) {
    const result = await ctx.prisma.program.findFirst({
      where: { OR: [ { id: input }, { code: input }] },
      include: {
        admins: checkProgramAdmin(ctx),
        modules: true,
      }
    })
    if (result) {
      if (result.published) return result
      if (ctx.role === 'ADMIN' || ctx.role === 'PROGRAM_ADMIN') return result
      throw new TRPCError({
        message: 'Unauthorized access to unpublished program',
        code: 'FORBIDDEN'
      })
    }
    throw new TRPCError({
      message: 'Program does not exist',
      code: 'NOT_FOUND'
    })
  })

const basicProgramSchema = {
  title: z.string(),
  description: z.string(),
  published: z.string().datetime().transform(function(v) { return new Date(v) }),
  bg_img_url: z.string().url().optional(),
  cover_img_url: z.string().url().optional(),
  admins: z.array(z.string()).optional()
}

export const createProgramSchema = {
  ...basicProgramSchema,
  code: z.string()
}

export const editProgramSchema = {
  ...basicProgramSchema,
  id: z.string()
}

const createProgram = procedure
  .use(isProgramAdmin)
  .input(z.object(createProgramSchema))
  .mutation(async function({ input, ctx }) {
    const { admins, ...others } = input
    const result = await ctx.prisma.program.create({
      data: others,
      select: { id: true }
    })
    if (admins) {
      await upsertProgramAdmin(admins, result.id, ctx)
    }
    return result
  })

const editProgram = procedure
  .use(isProgramAdmin)
  .input(z.object(editProgramSchema))
  .mutation(async function({ input, ctx }) {
    const { id, admins, ...others } = input
    const result = await ctx.prisma.program.update({
      data: others,
      select: { id: true },
      where: { id }
    })
    if (admins) {
      await upsertProgramAdmin(admins, result.id, ctx)
    }
    return result
  })

const deleteProgram = procedure
  .use(isAdmin)
  .input(z.string())
  .mutation(async function({ input, ctx }) {
    await ctx.prisma.program.delete({ where: { id: input }})
  })

const programRouter = router({
  getProgram,
  getPrograms,
  createProgram,
  editProgram,
  deleteProgram
})

export default programRouter