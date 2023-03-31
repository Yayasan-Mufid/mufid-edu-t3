import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.StudyGroupAnnouncementCountOrderByAggregateInput> =
  z
    .object({
      announcement_id: z.lazy(() => SortOrderSchema).optional(),
      study_group_id: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const StudyGroupAnnouncementCountOrderByAggregateInputObjectSchema =
  Schema;
