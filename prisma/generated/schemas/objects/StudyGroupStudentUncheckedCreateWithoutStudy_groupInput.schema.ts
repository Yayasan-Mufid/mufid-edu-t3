import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.StudyGroupStudentUncheckedCreateWithoutStudy_groupInput> =
  z
    .object({
      user_id: z.string(),
    })
    .strict();

export const StudyGroupStudentUncheckedCreateWithoutStudy_groupInputObjectSchema =
  Schema;
