import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";

export const isAdmin = middleware(async function({ ctx, next }) {
  console.log('ROle', ctx)
  if (ctx.role !== 'ADMIN') throw new TRPCError({
    message: 'Unauthorized',
    code: 'FORBIDDEN'
  }) 
  return next({ ctx })
})

export const isTreasurer = middleware(async function({ ctx, next }) {
  if (!(['ADMIN', 'TREASURER'] as Array<typeof ctx['role']>).includes(ctx?.role)) throw new TRPCError({
    message: 'Unauthorized',
    code: 'FORBIDDEN'
  })
  return next({ ctx })
})

export const isProgramAdmin = middleware(async function({ ctx, next }) {
  if (!(['ADMIN', 'PROGRAM_ADMIN'] as Array<typeof ctx['role']>).includes(ctx?.role)) throw new TRPCError({
    message: 'Unauthorized',
    code: 'FORBIDDEN'
  })
  return next({ ctx })
})

export const isModuleAdmin = middleware(async function({ ctx, next }) {
  if (!(['ADMIN', 'PROGRAM_ADMIN', 'MODULE_ADMIN'] as Array<typeof ctx['role']>).includes(ctx?.role)) throw new TRPCError({
    message: 'Unauthorized',
    code: 'FORBIDDEN'
  })
  return next({ ctx })
})

export const isClassAdmin = middleware(async function({ ctx, next }) {
  if (!(['ADMIN', 'PROGRAM_ADMIN', 'MODULE_ADMIN', 'CLASS_ADMIN'] as Array<typeof ctx['role']>).includes(ctx?.role)) throw new TRPCError({
    message: 'Unauthorized',
    code: 'FORBIDDEN'
  })
  return next({ ctx })
})

export const isStudent = middleware(async function({ ctx, next }) {
  if (ctx.role !== 'STUDENT') throw new TRPCError({
    message: 'Not a student',
    code: 'FORBIDDEN'
  })
  return next({ ctx })
})