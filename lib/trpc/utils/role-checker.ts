import type { Context } from '../context'

export function isAdmin(ctx: Context): boolean {
  return true
  // return ctx.role === 'ADMIN'
}

export function isProgramAdmin(ctx: Context): boolean {
  return true
  // return ctx.role === 'ADMIN' || ctx.role === 'PROGRAM_ADMIN'
}

export function isModuleAdmin(ctx: Context): boolean {
  return true
  // return ctx.role === 'ADMIN' || ctx.role === 'PROGRAM_ADMIN' || ctx.role === 'MODULE_ADMIN'
}

export function isClassAdmin(ctx: Context): boolean {
  return true
  // return ctx.role === 'ADMIN' || ctx.role === 'PROGRAM_ADMIN' || ctx.role === 'MODULE_ADMIN' || ctx.role === 'CLASS_ADMIN'
}