import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ProgramAdminMaxAggregateInputType> = z
  .object({
    id: z.literal(true).optional(),
    user_id: z.literal(true).optional(),
    program_id: z.literal(true).optional(),
    assigned_at: z.literal(true).optional(),
  })
  .strict();

export const ProgramAdminMaxAggregateInputObjectSchema = Schema;
