import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { UserOrderByWithRelationInputObjectSchema } from './UserOrderByWithRelationInput.schema';
import { StudyGroupAnnouncementOrderByRelationAggregateInputObjectSchema } from './StudyGroupAnnouncementOrderByRelationAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.AnnouncementOrderByWithRelationInput> = z
  .object({
    id: z.lazy(() => SortOrderSchema).optional(),
    created_by_id: z.lazy(() => SortOrderSchema).optional(),
    created_by: z
      .lazy(() => UserOrderByWithRelationInputObjectSchema)
      .optional(),
    title: z.lazy(() => SortOrderSchema).optional(),
    text: z.lazy(() => SortOrderSchema).optional(),
    start_date: z.lazy(() => SortOrderSchema).optional(),
    end_date: z.lazy(() => SortOrderSchema).optional(),
    public: z.lazy(() => SortOrderSchema).optional(),
    study_groups: z
      .lazy(
        () => StudyGroupAnnouncementOrderByRelationAggregateInputObjectSchema,
      )
      .optional(),
  })
  .strict();

export const AnnouncementOrderByWithRelationInputObjectSchema = Schema;
