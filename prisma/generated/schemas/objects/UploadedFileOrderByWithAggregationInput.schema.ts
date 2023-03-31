import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { UploadedFileCountOrderByAggregateInputObjectSchema } from './UploadedFileCountOrderByAggregateInput.schema';
import { UploadedFileMaxOrderByAggregateInputObjectSchema } from './UploadedFileMaxOrderByAggregateInput.schema';
import { UploadedFileMinOrderByAggregateInputObjectSchema } from './UploadedFileMinOrderByAggregateInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.UploadedFileOrderByWithAggregationInput> = z
  .object({
    id: z.lazy(() => SortOrderSchema).optional(),
    path: z.lazy(() => SortOrderSchema).optional(),
    uploader_id: z.lazy(() => SortOrderSchema).optional(),
    uploaded_at: z.lazy(() => SortOrderSchema).optional(),
    _count: z
      .lazy(() => UploadedFileCountOrderByAggregateInputObjectSchema)
      .optional(),
    _max: z
      .lazy(() => UploadedFileMaxOrderByAggregateInputObjectSchema)
      .optional(),
    _min: z
      .lazy(() => UploadedFileMinOrderByAggregateInputObjectSchema)
      .optional(),
  })
  .strict();

export const UploadedFileOrderByWithAggregationInputObjectSchema = Schema;
