import { z } from 'zod'
import { toZod } from 'tozod'
import { Module, Program } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { procedure, router } from '../trpc'
//import prisma from '@/lib/prisma'
import { isProgramAdmin, isModuleAdmin } from '../utils/middlewares'
import { isModuleAdmin as checkModuleAdmin } from '../utils/role-checker'
import { ModuleFindManySchema } from '@/prisma/generated/schemas'
import { Context } from '../context'

export const basicModuleSchema = {
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  published: z.string().datetime().nullable().optional(),
  cover_img_url: z.string().nullable().optional(),
  bg_img_url: z.string().nullable().optional(),
  seq: z.number(),
  admins: z.array(z.string()).optional()
}

export const createModuleSchema = {
  ...basicModuleSchema,
  program_id: z.string(),
  code: z.string(),
}

export const editModuleSchema = {
  ...basicModuleSchema,
  id: z.string()
}

async function upsertModuleAdmin(adminIds: string[], moduleId: string, ctx: Context) {
  return adminIds.reduce(function(prevPromise, curr) {
    return prevPromise.then(function() {
      return ctx.prisma.moduleAdmin.upsert({
        create: {
          assigned_at: new Date(),
          user_id: curr,
          module_id: moduleId
        },
        update: {},
        where: {
          module_id_user_id: {
            module_id: moduleId,
            user_id: curr
          }
        },
        select: { id: true }
      })
    })
  }, Promise.resolve({ id: '' }))
}

const createModule = procedure
  //.use(isProgramAdmin)
  .input(z.object(createModuleSchema))
  .mutation(async function({ input, ctx }) {
    const { admins, ...others } = input
    const result = await ctx.prisma.module.create({
      data: others,
      select: { id: true }
    })
    if (admins) {
      await upsertModuleAdmin(admins, result.id, ctx)
    }
    return result
  })

const programSchema: toZod<Program> = z.object({
  bg_img_url: z.string().url().nullable(),
  code: z.string(),
  cover_img_url: z.string().url().nullable(),
  description: z.string(),
  id: z.string(),
  published: z.date().nullable(),
  title: z.string()
})

const moduleSchema: toZod<Module> = z.object({
  archived: z.boolean(),
  bg_img_url: z.string().nullable(),
  code: z.string(),
  cover_img_url: z.string().nullable(),
  description: z.string(),
  id: z.string(),
  program_id: z.string(),
  published: z.date().nullable(),
  title: z.string(),
  slug: z.string().nullable(),
  seq: z.number().int(),  
})

const updateModule = procedure
  //.use(isModuleAdmin)
  .input(z.object(editModuleSchema))
  .mutation(async function({ input, ctx }) {
    const { admins, id, ...others } = input
    const result = await ctx.prisma.module.update({
      data: others,
      where: { id },
      select: { id: true }
    })
    if (admins) {
      await upsertModuleAdmin(admins, id, ctx)
    }
    return result
  })

const getModules = procedure
  .input(ModuleFindManySchema)
  .query(async function({ input, ctx }) {
    if ((['ADMIN', 'PROGRAM_ADMIN', 'MODULE_ADMIN'] as typeof ctx['role'][]).includes(ctx.role)) {
      return await ctx.prisma.module.findMany({ ...input, include: { program: true }})
    }
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only admins can view all module list'
    })
  })

const getModule = procedure
  .input(z.string())
  .query(async function({ input, ctx }) {
    const result = await ctx.prisma.module.findFirst({
      where: { OR: [{ id: input }, { code: input }] },
      include: {
        items: { orderBy: { seq: 'asc' }},
        admins: checkModuleAdmin(ctx),
        exams: checkModuleAdmin(ctx),
        study_groups: checkModuleAdmin(ctx),
        program: true
      }
    })
    if (result) {
      if ((['ADMIN', 'PROGRAM_ADMIN', 'MODULE_ADMIN'] as typeof ctx['role'][]).includes(ctx.role) && (result.published || new Date()) < new Date()) {
        return result
      }
      throw new TRPCError({
        message: 'Not authorized personel',
        code: 'FORBIDDEN'
      })
    }
    throw new TRPCError({
      message: 'Not found',
      code: 'NOT_FOUND'
    })
  })

const deleteModule = procedure
  //.use(isProgramAdmin)
  .input(z.string())
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.module.delete({ where: { id: input }})
  })

const moduleRouter = router({
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule
})

export default moduleRouter