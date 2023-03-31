import { z } from 'zod';
import { StudyGroupArgsObjectSchema } from './StudyGroupArgs.schema';
import { UserArgsObjectSchema } from './UserArgs.schema';
import { InvoiceArgsObjectSchema } from './InvoiceArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.StudyGroupApplicantInclude> = z
  .object({
    study_group: z
      .union([z.boolean(), z.lazy(() => StudyGroupArgsObjectSchema)])
      .optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsObjectSchema)]).optional(),
    invoice: z
      .union([z.boolean(), z.lazy(() => InvoiceArgsObjectSchema)])
      .optional(),
  })
  .strict();

export const StudyGroupApplicantIncludeObjectSchema = Schema;
