import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.StudyGroupScheduleUpdateManyMutationInput> = z
  .object({})
  .strict();

export const StudyGroupScheduleUpdateManyMutationInputObjectSchema = Schema;
