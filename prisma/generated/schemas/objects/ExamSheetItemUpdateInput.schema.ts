import { z } from 'zod';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { ExamSheetSectionUpdateOneRequiredWithoutItemsNestedInputObjectSchema } from './ExamSheetSectionUpdateOneRequiredWithoutItemsNestedInput.schema';
import { QuestionUpdateOneRequiredWithoutExam_itemsNestedInputObjectSchema } from './QuestionUpdateOneRequiredWithoutExam_itemsNestedInput.schema';
import { NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { NullableFloatFieldUpdateOperationsInputObjectSchema } from './NullableFloatFieldUpdateOperationsInput.schema';
import { NullableDateTimeFieldUpdateOperationsInputObjectSchema } from './NullableDateTimeFieldUpdateOperationsInput.schema';
import { UserUpdateOneWithoutGraded_exam_itemNestedInputObjectSchema } from './UserUpdateOneWithoutGraded_exam_itemNestedInput.schema';
import { IntFieldUpdateOperationsInputObjectSchema } from './IntFieldUpdateOperationsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ExamSheetItemUpdateInput> = z
  .object({
    id: z
      .union([
        z.string(),
        z.lazy(() => StringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
    section: z
      .lazy(
        () =>
          ExamSheetSectionUpdateOneRequiredWithoutItemsNestedInputObjectSchema,
      )
      .optional(),
    question: z
      .lazy(
        () => QuestionUpdateOneRequiredWithoutExam_itemsNestedInputObjectSchema,
      )
      .optional(),
    choices_id: z
      .union([
        z.string(),
        z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    answer: z
      .union([
        z.string(),
        z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    score: z
      .union([
        z.number(),
        z.lazy(() => NullableFloatFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    graded_note: z
      .union([
        z.string(),
        z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    graded_at: z
      .union([
        z.date(),
        z.lazy(() => NullableDateTimeFieldUpdateOperationsInputObjectSchema),
      ])
      .optional()
      .nullable(),
    graded_by: z
      .lazy(() => UserUpdateOneWithoutGraded_exam_itemNestedInputObjectSchema)
      .optional(),
    seq: z
      .union([
        z.number(),
        z.lazy(() => IntFieldUpdateOperationsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const ExamSheetItemUpdateInputObjectSchema = Schema;
