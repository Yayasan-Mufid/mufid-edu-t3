import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ProductAvgAggregateInputType> = z
  .object({
    unit_price: z.literal(true).optional(),
  })
  .strict();

export const ProductAvgAggregateInputObjectSchema = Schema;
