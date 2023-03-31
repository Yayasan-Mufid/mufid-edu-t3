import { z } from 'zod';
import { ModuleCreateNestedOneWithoutItemsInputObjectSchema } from './ModuleCreateNestedOneWithoutItemsInput.schema';
import { ModuleItemCreateNestedManyWithoutParent_itemInputObjectSchema } from './ModuleItemCreateNestedManyWithoutParent_itemInput.schema';
import { ModuleItemCreateNestedOneWithoutChildrenInputObjectSchema } from './ModuleItemCreateNestedOneWithoutChildrenInput.schema';
import { ModuleItemAttachmentCreateNestedManyWithoutModule_itemInputObjectSchema } from './ModuleItemAttachmentCreateNestedManyWithoutModule_itemInput.schema';
import { ModuleItemStatusCreateNestedManyWithoutModule_itemInputObjectSchema } from './ModuleItemStatusCreateNestedManyWithoutModule_itemInput.schema';
import { StudyGroupScheduleCreateNestedManyWithoutModule_itemInputObjectSchema } from './StudyGroupScheduleCreateNestedManyWithoutModule_itemInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ModuleItemCreateWithoutQuizInput> = z
  .object({
    id: z.string().optional(),
    module: z.lazy(() => ModuleCreateNestedOneWithoutItemsInputObjectSchema),
    children: z
      .lazy(() => ModuleItemCreateNestedManyWithoutParent_itemInputObjectSchema)
      .optional(),
    parent_item: z
      .lazy(() => ModuleItemCreateNestedOneWithoutChildrenInputObjectSchema)
      .optional(),
    is_root: z.boolean().optional().nullable(),
    title: z.string(),
    code: z.string(),
    text: z.string(),
    seq: z.number().optional(),
    is_quiz: z.boolean().optional(),
    mandatory: z.boolean().optional(),
    cover_img_url: z.string().optional().nullable(),
    bg_img_url: z.string().optional().nullable(),
    attachments: z
      .lazy(
        () =>
          ModuleItemAttachmentCreateNestedManyWithoutModule_itemInputObjectSchema,
      )
      .optional(),
    user_status: z
      .lazy(
        () =>
          ModuleItemStatusCreateNestedManyWithoutModule_itemInputObjectSchema,
      )
      .optional(),
    schedule: z
      .lazy(
        () =>
          StudyGroupScheduleCreateNestedManyWithoutModule_itemInputObjectSchema,
      )
      .optional(),
  })
  .strict();

export const ModuleItemCreateWithoutQuizInputObjectSchema = Schema;
