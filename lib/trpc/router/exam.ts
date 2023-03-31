import moment from 'moment'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import type { Exam, ExamSection, ExamSheet, Question, QuestionChoice } from '@prisma/client'
import { isModuleAdmin, isClassAdmin, isStudent } from '../utils/middlewares'
import { toZod } from 'tozod'
import { procedure, router } from '../trpc'
//import prisma from '@/lib/prisma'
import {
  ExamFindFirstSchema,
  ExamFindManySchema,
  ExamUpdateOneSchema,
  ExamSectionCreateOneSchema,
  ExamCreateOneSchema,
  ExamSectionUpdateOneSchema,
  ExamSectionFindFirstSchema,
  ExamSectionFindManySchema,
  ExamSheetFindManySchema,
  ExamSheetFindFirstSchema,
  QuestionCreateOneSchema,
  QuestionChoiceCreateManyInputObjectSchema,
} from '@/prisma/generated/schemas'
import { includes } from 'lodash'
import { Context } from '../context'

const ExamSchema: toZod<Exam> = z.object({
  code: z.string(),
  id: z.string(),
  module_id: z.string(),
  rules: z.string(),
  title: z.string()
})

const ExamSectionSchema: toZod<ExamSection> = z.object({
  default_point: z.number(),
  exam_id: z.string(),
  id: z.string(),
  nb_of_questions: z.number().int(),
  randomize_questions: z.boolean(),
  seq: z.number().int(),
  text: z.string(),
  title: z.string(),
  weight: z.number()
})

const QuestionSchema: toZod<Question> = z.object({
  created_at: z.date(),
  created_by_id: z.string(),
  grading_hint: z.string().nullable(),
  id: z.string(),
  max_score: z.number(),
  module_id: z.string().nullable(),
  program_id: z.string().nullable(),
  randomize_choices: z.boolean(),
  text: z.string(),
  type: z.string(),
  validated_at: z.date().nullable(),
  validated_by_id: z.string().nullable(),
  validator_note: z.string().nullable(),
})

const QuestionChoiceSchema: toZod<QuestionChoice> = z.object({
  answer_key: z.boolean(),
  id: z.string(),
  question_id: z.string(),
  text: z.string(),
  seq: z.number().int()
})

const getExams = procedure
  //.use(isModuleAdmin)
  .input(ExamFindManySchema)
  .output(z.array(ExamSchema))
  .query(async function({ input, ctx }) {
    return await ctx.prisma.exam.findMany(input)
  })

const getExam = procedure
  //.use(isModuleAdmin)
  .input(ExamFindFirstSchema)
  .output(ExamSchema.nullish())
  .query(async function({ input, ctx }) {
    return await ctx.prisma.exam.findFirst(input)
  })

const createExam = procedure
  //.use(isModuleAdmin)
  .input(ExamCreateOneSchema)
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.exam.create(input)
  })

const updateExam = procedure
  //.use(isModuleAdmin)
  .input(ExamUpdateOneSchema)
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.exam.update(input)
  })

const deleteExam = procedure
  //.use(isModuleAdmin)
  .input(z.object({ exam_id: z.string() }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.exam.delete({ where: { id: input.exam_id } })
  })

const getExamSections = procedure
  //.use(isModuleAdmin)
  .input(ExamSectionFindManySchema)
  .output(z.array(ExamSectionSchema))
  .query(async function({ input, ctx }) {
    return await ctx.prisma.examSection.findMany(input)
  })

const getExamSection = procedure
  //.use(isModuleAdmin)
  .input(ExamSectionFindFirstSchema)
  .output(ExamSectionSchema.nullable())
  .query(async function({ input, ctx }) {
    return await ctx.prisma.examSection.findFirst(input)
  })

const createExamSection = procedure
  //.use(isModuleAdmin)
  .input(ExamSectionCreateOneSchema)
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.examSection.create(input)
  })

const updateExamSection = procedure
  //.use(isModuleAdmin)
  .input(ExamSectionUpdateOneSchema)
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.examSection.update(input)
  })

const deleteExamSection = procedure
  //.use(isModuleAdmin)
  .input(z.object({ section_id: z.string() }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.examSection.delete({ where: { id: input.section_id }})
  })

const createQuestion = procedure
  //.use(isClassAdmin)
  .input(QuestionCreateOneSchema.extend({
    choices: z.array(z.object({
      text: z.string(),
      answer_key: z.boolean().optional()
    })).optional()
  }))
  .mutation(async function({ input, ctx }) {
    const { choices, ...questionOpt } = input
    const question = await ctx.prisma.question.create(questionOpt)
    if (['RADIO', 'CHECKBOXES'].includes(question.type) && choices) {
      const savedChoices = await ctx.prisma.questionChoice.createMany({
        data: choices.map(function(choice, idx) {
          return {
            question_id: question.id,
            text: choice.text,
            answer_key: choice.answer_key,
            seq: idx
          }
        })
      })
    }
    return { id: question.id }
  })

const approveQuestion = procedure
  //.use(isModuleAdmin)
  .input(z.object({ question_id: z.string() }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.question.update({
      data: { validated_at: new Date(), validated_by_id: ctx.userId },
      where: { id: input.question_id }
    })
  })

const addQuestionsToExamSection = procedure
  //.use(isModuleAdmin)
  .input(z.object({
    section_id: z.string(),
    questions: z.array(z.object({
      question_id: z.string(),
      max_score: z.number().optional(),
      min_score: z.number().optional()
    }))
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.examSectionQuestion.createMany({
      data: input.questions.map(function(q) {
        return {
          question_id: q.question_id,
          section_id: input.section_id,
          max_score: q.max_score,
          min_score: q.min_score,
        }
      }),
      skipDuplicates: true
    })
  })

const deleteQuestionsFromExamSection = procedure
  //.use(isModuleAdmin)
  .input(z.object({
    section_id: z.string(),
    question_ids: z.array(z.string())
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.examSectionQuestion.deleteMany({
      where: {
        section_id: input.section_id,
        question_id: {
          in: input.question_ids
        }
      }
    })
  })

const addStudyGroupExam = procedure
  //.use(isModuleAdmin)
  .input(z.object({
    group_id: z.string(),
    exam_id: z.string(),
    start_time: z.date(),
    end_time: z.date(),
    duration_hour: z.number(),
    weight: z.number().optional()
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.studyGroupExam.create({
      data: input,
      select: { id: true }
    })
  })

function randomizeArray(arg: Array<any>): Array<any> {
  const [shuffled, remaining] = arg.reduce(function(acc: [Array<any>, Array<any>], curr) {
    const rand = Math.floor(Math.random() * acc[1].length)
    const remainingCopy = [...arg[1]]
    const picked = remainingCopy.splice(rand, 1)
    return [[...acc[0], ...picked], remainingCopy]
  }, [[], arg] as [Array<any>, Array<any>])
  return shuffled
}

async function getSectionQuestions(cumulative: Record<string, string[]>, section: { id: string }, ctx: Context): Promise<Record<string, string[]>> {
  const result = await ctx.prisma.examSectionQuestion.findMany({
    where: { section_id: section.id },
    select: { question_id: true }
  })
  return {
    ...cumulative,
    [section.id]: result.map(function({ question_id }) { return question_id })
  }
}

async function generateSheet(group_exam_id: string, exam_sheet_ids: string[], ctx: Context): Promise<any> {
  const groupExam = await ctx.prisma.studyGroupExam.findFirst({ where: { id: group_exam_id }})
  if (groupExam) {
    const sections = await ctx.prisma.examSection.findMany({
      where: { exam_id: groupExam.exam_id },
      orderBy: { seq: 'asc' },
      select: {
        id: true,
        randomize_questions: true,
        nb_of_questions: true,
      }
    })
    const sectionQuestions = await sections.reduce(function(prevPromise, currSection) {
      return prevPromise.then(function(acc) {
        return getSectionQuestions(acc, currSection, ctx)
      })
    }, Promise.resolve({}) as Promise<Record<string, string[]>>)
    return sections.reduce(function(prevPromise, curr) {
      return prevPromise.then(function() {
        return ctx.prisma.examSheetSection.createMany({
          data: exam_sheet_ids.map(function(exam_sheet_id) {
            return {
              exam_sheet_id,
              section_id: curr.id,
              items: {
                create: randomizeArray(sectionQuestions[curr.id])
                  .slice(0, curr.nb_of_questions - 1)
                  .map(function(question_id, idx) {
                    return {
                      section_id: curr.id,
                      question_id,
                      seq: idx
                    }
                  })
              }
            }
          }),
          skipDuplicates: true
        })
      })
    }, Promise.resolve() as Promise<any>)
  }
}

const generateExamSheets = procedure
  //.use(isClassAdmin)
  .input(z.object({
    group_exam_id: z.string(),
    user_ids: z.array(z.string())
  }))
  .mutation(async function({ input, ctx }) {
    const group_exam = await ctx.prisma.studyGroupExam.findFirst({
      where: { id: input.group_exam_id },
      include: {
        exam: {
          include: {
            sections: {
              orderBy: { seq: 'asc' }
            }
          }
        }
      }
    })
    if (group_exam) {
      await ctx.prisma.examSheet.createMany({
        data: input.user_ids.map(function(id) {
          return {
            group_exam_id: group_exam.id,
            user_id: id,
            sections: {
              create: group_exam.exam.sections.map(function(section) {
                return {
                  section_id: section.id
                }
              })
            }
          }
        }),
        skipDuplicates: true,
      })
      const sheets = await ctx.prisma.examSheet.findMany({
        where: { group_exam_id: group_exam.id },
      })
      return generateSheet(group_exam.id, sheets.map(function({ id }) { return id }), ctx)      
    }
  })

const resetExamSheets = procedure
  //.use(isClassAdmin)
  .input(z.object({
    group_exam_id: z.string(),
    exam_sheet_ids: z.array(z.string()),
  }))
  .mutation(async function({ input, ctx }) {
    const examSheets = await ctx.prisma.examSheet.findMany({ where: { id: { in: input.exam_sheet_ids } }})
    const sections = await ctx.prisma.examSheetSection.findMany({
      where: { exam_sheet_id: { in: input.exam_sheet_ids } }
    })
    await ctx.prisma.examSheetItem.deleteMany({
      where: {
        section_id: {
          in: sections.map(function({ id }) { return id })
        }
      }
    })
    await generateSheet(input.group_exam_id, examSheets.map(function({ id }) { return id }), ctx)
  })

const getExamSheets = procedure
  //.use(isClassAdmin)
  .input(ExamSheetFindManySchema)
  .query(async function({ input, ctx }) {
    return await ctx.prisma.examSheet.findMany(input)
  })

const getExamSheet = procedure
  //.use(isClassAdmin)
  .input(ExamSheetFindFirstSchema)
  .query(async function({ input, ctx }) {
    return await ctx.prisma.examSheet.findFirst(input)
  })


const openExamSheet = procedure
  //.use(isStudent)
  .input(z.object({ sheet_id: z.string() }))
  .query(async function({ input, ctx }) {
    const sheet = await ctx.prisma.examSheet.findFirst({
      where: { id: input.sheet_id },
      include: {
        sections: {
          include: {
            items: {
              select: {
                answer: true,
                question: {
                  select: {
                    text: true,
                  },
                  include: {
                    choices: {
                      select: {
                        id: true,
                        text: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        group_exam: {
          select: {
            end_time: true,
            duration_hour: true,
          }
        }
      }
    })
    if (sheet) {
      const now = new Date()
      if (sheet.user_id === ctx.userId) {
        if (!sheet.start_time) {
          const endTime = moment().add(sheet.group_exam.duration_hour, 'hour').isSameOrBefore(moment(sheet.group_exam.end_time)) ? moment().add(sheet.group_exam.duration_hour, 'hour').toDate() : sheet.group_exam.end_time
          await ctx.prisma.examSheet.update({
            data: {
              token_text: ctx.tokenTxt,
              start_time: now,
              end_time: endTime
            },
            where: { id: sheet.id }
          })
          sheet.start_time = now
          sheet.end_time = endTime
          return sheet
        }
        if (sheet.end_time) {
          if (sheet.token_text === ctx.tokenTxt) {
            if (now <= sheet.end_time) return sheet
          }
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'The exam is over'
          })
        }
      }
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Unauthorized access to exam'
      })
    }
  })

const openExamSheetForGrading = procedure
  //.use(isClassAdmin)
  .input(z.object({
    sheet_id: z.string()
  }))
  .query(async function({ input, ctx }) {
    const sheet: ExamSheet | null = await ctx.prisma.examSheet.findFirst({
      where: { id: input.sheet_id },
      include: {
        sections: {
          orderBy: { section: { seq: 'asc' } },
          include: {
            section: {
              select: {
                text: true,
                title: true,
                weight: true
              },
            },
            items: {
              orderBy: {
                seq: 'asc'
              },
              select: {
                answer: true,
                graded_at: true,
                graded_by_id: true,
                score: true,
              },
              include: {
                question: {
                  select: {
                    text: true,
                    type: true,
                    grading_hint: true,
                    randomize_choices: true
                  },
                  include: {
                    choices: {
                      orderBy: {
                        seq: 'asc'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    if (sheet) {
      if (sheet.grader_id === ctx.userId) {
        return sheet
      }
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'User is not assigned to grade this exam sheet'
      })
    }
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Sheet does not exist'
    })
  })

const answerExamSheet = procedure
  //.use(isStudent)
  .input(z.object({
    sheet_id: z.string(),
    items: z.array(z.object({
      item_id: z.string(),
      answer: z.string()
    }))
  }))
  .mutation(async function({ input, ctx }) {
    const now = new Date()
    const sheet = await ctx.prisma.examSheet.findFirst({ where: { id: input.sheet_id }})
    if (sheet) {
      if (sheet.end_time) {
        if (now < sheet.end_time) {
          await Promise.all(input.items.map(function(curr) {
            const { answer, item_id } = curr
            return ctx.prisma.examSheetItem.update({
              data: { answer },
              where: { id: item_id }
            })
          }))
          return await ctx.prisma.examSheet.update({
            data: { status: 'ANSWERED' },
            where: { id: input.sheet_id }
          })
        }
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Already timeout'
        })
      }
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Sheet not opened yet'
      })
    }
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Invalid Exam Sheet'
    })
  })

const gradeExamSheet = procedure
  //.use(isClassAdmin)
  .input(z.object({
    sheet_id: z.string(),
    grader_notes: z.string(),
    items: z.array(z.object({
      item_id: z.string(),
      graded_note: z.string(),
      score: z.number()
    }))
  }))
  .mutation(async function({ input, ctx }) {
    const now = new Date()
    const sheet = await ctx.prisma.examSheet.findFirst({
      where: { id: input.sheet_id },
      include: { sections: {
        select: {
          id: true,
          section: {
            select: {
              weight: true,
              id: true
            }
          }
        }
      } }
    })
    if (sheet && ctx.userId) {
      await input.items.map(function({ item_id, graded_note, score }) {
        return ctx.prisma.examSheetItem.update({
          data: { graded_note, score, graded_by_id: `${ctx.userId}`, graded_at: now },
          where: { id: item_id }
        })
      })
      const score = await sheet.sections.reduce(function(prevPromise, { id, section }) {
        return prevPromise.then(function(acc) {
          return ctx.prisma.examSheetItem.findMany({ where: { section_id: id }}).then(function(items) {
            const score = items.reduce(function(scoreAcc, curr) {
              return scoreAcc + (curr.score || 0)
            }, 0)
            return 0 + ((section.weight || 1) * score)
          })
        })
      }, Promise.resolve(0) as Promise<number>)
      return await ctx.prisma.examSheet.update({
        data: {
          graded_at: now,
          grader_notes: input.grader_notes,
          status: 'GRADED',
          score
        },
        where: { id: sheet.id }
      })

    }
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Invalid Exam Sheet'
    })
  })

const assignGraderToExamSheet = procedure
  //.use(isClassAdmin)
  .input(z.object({
    sheet_ids: z.string().array(),
    user_id: z.string()
  }))
  .mutation(async function({ input, ctx }) {
    return await ctx.prisma.examSheet.updateMany({
      data: { grader_id: input.user_id },
      where: {
        id: {
          in: input.sheet_ids
        }
      }
    })
  })

const examRouter = router({
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  getExamSections,
  getExamSection,
  createExamSection,
  updateExamSection,
  deleteExamSection,
  createQuestion,
  approveQuestion,
  addQuestionsToExamSection,
  deleteQuestionsFromExamSection,
  addStudyGroupExam,
  generateExamSheets,
  resetExamSheets,
  openExamSheet,
  answerExamSheet,
  gradeExamSheet,
  openExamSheetForGrading,
  getExamSheets,
  getExamSheet,
  assignGraderToExamSheet
})

export default examRouter