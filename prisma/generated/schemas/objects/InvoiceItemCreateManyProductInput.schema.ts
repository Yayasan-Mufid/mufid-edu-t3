import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.InvoiceItemCreateManyProductInput> = z
  .object({
    id: z.string().optional(),
    invoice_id: z.string(),
    name: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    discount: z.number(),
  })
  .strict();

export const InvoiceItemCreateManyProductInputObjectSchema = Schema;
