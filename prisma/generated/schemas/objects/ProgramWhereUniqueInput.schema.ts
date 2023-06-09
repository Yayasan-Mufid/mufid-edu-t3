import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ProgramWhereUniqueInput> = z
  .object({
    id: z.string().optional(),
    code: z.string().optional(),
    title: z.string().optional(),
  })
  .strict();

export const ProgramWhereUniqueInputObjectSchema = Schema;
