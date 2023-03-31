import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ModuleAdminCreateManyUserInput> = z
  .object({
    id: z.string().optional(),
    module_id: z.string(),
    assigned_at: z.date().optional(),
  })
  .strict();

export const ModuleAdminCreateManyUserInputObjectSchema = Schema;
