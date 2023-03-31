import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.UploadedFileCreateManyInput> = z
  .object({
    id: z.string().optional(),
    path: z.string(),
    uploader_id: z.string(),
    uploaded_at: z.date().optional(),
  })
  .strict();

export const UploadedFileCreateManyInputObjectSchema = Schema;
