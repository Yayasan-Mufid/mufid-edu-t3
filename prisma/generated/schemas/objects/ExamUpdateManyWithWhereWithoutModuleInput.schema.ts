import { z } from 'zod';
import { ExamScalarWhereInputObjectSchema } from './ExamScalarWhereInput.schema';
import { ExamUpdateManyMutationInputObjectSchema } from './ExamUpdateManyMutationInput.schema';
import { ExamUncheckedUpdateManyWithoutExamsInputObjectSchema } from './ExamUncheckedUpdateManyWithoutExamsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ExamUpdateManyWithWhereWithoutModuleInput> = z
  .object({
    where: z.lazy(() => ExamScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => ExamUpdateManyMutationInputObjectSchema),
      z.lazy(() => ExamUncheckedUpdateManyWithoutExamsInputObjectSchema),
    ]),
  })
  .strict();

export const ExamUpdateManyWithWhereWithoutModuleInputObjectSchema = Schema;
