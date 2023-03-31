import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { procedure, router } from '../trpc'
import { isModuleAdmin } from '../utils/middlewares'
//import prisma from '@/lib/prisma'


const basicModuleItemaAttachmentSchema = {
  description: z.string(),
  type: z.string(),
  url: z.string().url(),
  seq: z.number(),
  mandatory: z.boolean()
}

const basicModuleItemAttachment = z.object(basicModuleItemaAttachmentSchema)

type BasicModuleItemAttachment = z.infer<typeof basicModuleItemAttachment>

const editBasicModuleItemAttachmentSchema = {
  ...basicModuleItemaAttachmentSchema,
  id: z.string()
}

const editBasicModuleItemAttachment = z.object(editBasicModuleItemAttachmentSchema)

type EditBasicModuleItemAttachment = z.infer<typeof editBasicModuleItemAttachment>

const basicModuleItemSchema = {
  title: z.string(),
  code: z.string(),
  text: z.string(),
  seq: z.number(),
  mandatory: z.boolean(),
  cover_img_url: z.string().url().nullable().optional(),
  bg_img_url: z.string().url().nullable().optional(),
}


export const createModuleItemSchema = {
  ...basicModuleItemSchema,
  module_id: z.string(),
  parent_item_id: z.string().optional(),
  is_root: z.boolean().optional(),
  attachments: z.array(basicModuleItemAttachment).optional()
}

const editModuleItemSchema = {
  ...basicModuleItemSchema,
  id: z.string(),
  attachments: z.array(basicModuleItemAttachment.or(editBasicModuleItemAttachment))
}

const getModuleItems = procedure
  .input(z.object({
    module_id: z.string().optional(),
    parent_item_id: z.string().optional()
  }))
  .query(async function({ input, ctx }) {
    if (input.parent_item_id) return await ctx.prisma.moduleItem.findMany({
      where: { parent_item_id: input.parent_item_id },
      orderBy: { seq: 'asc' },
      include: {
        attachments: { orderBy: { seq: 'asc' }},
        parent_item: true
      }
    })
    if (input.module_id) return await ctx.prisma.moduleItem.findMany({
      where: { module_id: input.module_id },
      orderBy: { seq: 'asc' },
      include: {
        attachments: { orderBy: { seq: 'asc' } },
        parent_item: true
      }
    })
    throw new TRPCError({
      code: 'BAD_REQUEST'
    })
  })

const getModuleItem = procedure
  .input(z.string())
  .query(async function({ input, ctx }) {
    return await ctx.prisma.moduleItem.findFirst({
      where: { OR: [{ id: input }, { code: input }] },
      include: {
        attachments: { orderBy: { seq: 'asc' } },
        parent_item: true,
        module: {
          include: {
            program: true
          }
        },
      }
    })
  })

const createModuleItem = procedure
  //.use(isModuleAdmin)
  .input(z.object(createModuleItemSchema))
  .mutation(async function({ input, ctx }) {
    const { attachments, ...others } = input
    const result = await ctx.prisma.moduleItem.create({
      data: others,
      select: { id: true, code: true }
    })
    if (attachments) {
      if (attachments?.length > 0) {
        await attachments.reduce(function(prevPromise, curr) {
          return prevPromise.then(function({ id }) {
            return ctx.prisma.moduleItemAttachment.create({
              data: {
                ...(curr as BasicModuleItemAttachment),
                module_item_id: result.id
              },
              select: { id: true }
            })
          })
        }, Promise.resolve({ id: '' }))
      }
    }
    return result
  })

const editModuleItem = procedure
  //.use(isModuleAdmin)
  .input(z.object(editModuleItemSchema))
  .mutation(async function({ input, ctx }) {
    const { id, attachments, ...others } = input
    const result = await ctx.prisma.moduleItem.update({
      data: others,
      where: { id }
    })
    if (attachments) {
      if (attachments.length > 0) {
        await attachments.reduce(function(prevPromise, curr) {
          return prevPromise.then(function() {
            if ('id' in curr) return ctx.prisma.moduleItemAttachment.create({
              data: { ...curr as BasicModuleItemAttachment, module_item_id: id },
              select: { id: true }
            })
            const { id: attachmentId, ...attchOthers } = curr as EditBasicModuleItemAttachment
            return ctx.prisma.moduleItemAttachment.update({
              data: attchOthers,
              where: { id: attachmentId },
              select: { id: true }
            })
          })
        }, Promise.resolve({ id: '' }))
      }
    }
    return result
  })

const deleteModuleItem = procedure
  //.use(isModuleAdmin)
  .input(z.string())
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.moduleItem.delete({ where: { id: input }})
  })

const deleteModuleItemAttachment = procedure
  //.use(isModuleAdmin)
  .input(z.string())
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.moduleItemAttachment.delete({ where: { id: input }})
  })

const setAttachmentStatus = procedure
  .input(z.object({
    attachment_id: z.string(),
    status: z.string()
  }))
  .mutation(async function({ input, ctx }) {
    if (ctx?.userId) {
      return await ctx.prisma.moduleItemAttachmentStatus.upsert({
        create: {
          user_id: ctx.userId,
          attachment_id: input.attachment_id,
          status: input.status,
          updated_at: new Date()
        },
        update: {
          status: input.status,
          updated_at: new Date()
        },
        where: { attachment_id_user_id: { user_id: ctx.userId, attachment_id: input.attachment_id }}
      })
    }
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Not authenticated/authorized'
    })
  })

const moduleItemRouter = router({
  getModuleItem,
  getModuleItems,
  createModuleItem,
  editModuleItem,
  deleteModuleItem,
  deleteModuleItemAttachment,
  setAttachmentStatus,
})

export default moduleItemRouter