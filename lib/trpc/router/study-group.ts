import { z } from 'zod'
import  { toZod } from 'tozod'
import { StudyGroup } from '@prisma/client'
import { procedure, router } from '../trpc'
import { isAdmin, isModuleAdmin, isClassAdmin } from '../utils/middlewares'
import { isModuleAdmin as checkModuleAdmin } from '../utils/role-checker'
//import prisma from '@/lib/prisma'
import {
  StudyGroupFindFirstSchema,
  StudyGroupFindManySchema,
  StudyGroupCreateOneSchema,
  StudyGroupUpdateOneSchema,
  StudyGroupDeleteOneSchema
} from '@/prisma/generated/schemas'

export const studyGroupSchema: toZod<StudyGroup> = z.object({
  gender: z.string(), //['MALE', 'FEMALE']
  name: z.string(),
  code: z.string(),
  module_id: z.string(),
  capacity: z.number(),
  enrollment_start: z.date(),
  enrollment_end: z.date(),
  active_start: z.date(),
  active_end: z.date(),
  logo_url: z.string().url(),
  invoice_amount: z.number(),
  invoice_title: z.string(),
  invoice_account_id: z.string(),
  use_schedule: z.boolean().nullable(),
  application_note: z.string().nullable(),
  id: z.string()
})

const createStudyGroup = procedure
  //.use(isModuleAdmin)
  .input(StudyGroupCreateOneSchema)
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.studyGroup.create(input)
  })

const addClassAdmins = procedure
  //.use(isModuleAdmin)
  .input(z.object({
    group_id: z.string(),
    user_ids: z.array(z.string())
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.studyGroupAdmin.createMany({
      data: input.user_ids.map(function(id) {
        return {
          study_group_id: input.group_id,
          user_id: id
        }
      }),
      skipDuplicates: true
    })
  })

const removeClassAdmins = procedure
  //.use(isModuleAdmin)
  .input(z.object({
    group_id: z.string(),
    user_ids: z.array(z.string())
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.studyGroupAdmin.deleteMany({
      where: {
        study_group_id: input.group_id,
        user_id: {
          in: input.user_ids
        }
      }
    })
  })

const updateStudyGroup = procedure
  //.use(isModuleAdmin)
  .input(StudyGroupUpdateOneSchema)
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.studyGroup.update(input)
  })

const getStudyGroups = procedure
  .input(StudyGroupFindManySchema)
  .output(z.array(studyGroupSchema))
  .query(async function({ input, ctx }) {
    return await ctx.prisma.studyGroup.findMany(input)
  })

const getStudyGroup = procedure
  .input(StudyGroupFindFirstSchema)
  .output(studyGroupSchema.nullable())
  .query(async function({ input, ctx }) {
    const ismoduleadmin = checkModuleAdmin(ctx)
    return await ctx.prisma.studyGroup.findFirst(Object.assign(
      input,
      {
        include: {
          admins: ismoduleadmin,
          announcements: ismoduleadmin,
          schedule: ismoduleadmin,
          applicants: ismoduleadmin,
          students: ismoduleadmin,
          exams: ismoduleadmin,
          invoice_account: ismoduleadmin
        }
      } as z.infer<typeof StudyGroupFindFirstSchema>))
  })

const deleteStudyGroup = procedure
  //.use(isAdmin)
  .input(StudyGroupDeleteOneSchema)
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.studyGroup.delete(input)
  })

const admitToStudyGroup = procedure
  //.use(isClassAdmin)
  .input(z.object({
    study_group_id: z.string(),
    applicants_id: z.array(z.string())
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.studyGroupStudent.createMany({
      data: input.applicants_id.map(function(id) {
        return {
          study_group_id: input.study_group_id,
          user_id: id
        }
      })
    })
  })

const removeFromStudyGroup = procedure
  //.use(isClassAdmin)
  .input(z.object({
    study_group_id: z.string(),
    student_ids: z.array(z.string())
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.studyGroupStudent.deleteMany({
      where: {
        study_group_id: input.study_group_id,
        user_id: {
          in: input.student_ids
        }
      }
    })
  })

const registerToStudyGroup = procedure
  .input(z.object({
    study_group_id: z.string(),
    payment_method: z.string()
  }))
  .mutation(async function({ input, ctx }) {
    if (ctx.userId) {
      const theStudyGroup = await ctx.prisma.studyGroup.findFirst({
        where: { id: input.study_group_id },
        include: {
          applicants: true,
          module: true
        }
      })
      const theUser = await ctx.prisma.user.findFirst({
        where: { id: ctx.userId }
      })
      if (theUser && theStudyGroup) {
        if (theUser.gender === theStudyGroup.gender) {
          if (theStudyGroup.applicants.length + 1 < theStudyGroup.capacity) {
            const thePaymentAccount = await ctx.prisma.paymentAccount.findFirst({ where: { id: theStudyGroup.invoice_account_id }})
            if (thePaymentAccount) {
              const theInvoice = await ctx.prisma.invoice.create({
                data: {
                  amount: theStudyGroup.invoice_amount,
                  description: `Pendaftaran Kelas ${theStudyGroup.module.title}`,
                  deadline: theStudyGroup.enrollment_end,
                  title: `Pendaftaran Kelas ${theStudyGroup.module.title}`,
                  payment_account_id: theStudyGroup.invoice_account_id,
                  user_id: ctx.userId,
                  payment_method: input.payment_method
                }
              })
              return await ctx.prisma.studyGroupApplicant.upsert({
                create: {
                  user_id: ctx.userId,
                  study_group_id: input.study_group_id,
                  created_at: new Date(),
                  invoice_id: theInvoice.id
                },
                update: {},
                where: {
                  study_group_id_user_id: {
                    user_id: ctx.userId,
                    study_group_id: input.study_group_id
                  }
                }
              })
            }
            return await ctx.prisma.studyGroupApplicant.upsert({
              create: {
                user_id: ctx.userId,
                study_group_id: input.study_group_id,
                created_at: new Date(),
              },
              update: {},
              where: {
                study_group_id_user_id: {
                  user_id: ctx.userId,
                  study_group_id: input.study_group_id
                }
              }
            })
          }
        }
      }
    }
  })

const studyGroupRouter = router({
  createStudyGroup,
  updateStudyGroup,
  getStudyGroups,
  getStudyGroup,
  deleteStudyGroup,
  registerToStudyGroup,
  admitToStudyGroup,
  removeFromStudyGroup,
  addClassAdmins,
  removeClassAdmins
})

export default studyGroupRouter