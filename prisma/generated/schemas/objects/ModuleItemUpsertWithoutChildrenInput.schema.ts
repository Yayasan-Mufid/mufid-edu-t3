import { z } from 'zod';
import { ModuleItemUpdateWithoutChildrenInputObjectSchema } from './ModuleItemUpdateWithoutChildrenInput.schema';
import { ModuleItemUncheckedUpdateWithoutChildrenInputObjectSchema } from './ModuleItemUncheckedUpdateWithoutChildrenInput.schema';
import { ModuleItemCreateWithoutChildrenInputObjectSchema } from './ModuleItemCreateWithoutChildrenInput.schema';
import { ModuleItemUncheckedCreateWithoutChildrenInputObjectSchema } from './ModuleItemUncheckedCreateWithoutChildrenInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ModuleItemUpsertWithoutChildrenInput> = z
  .object({
    update: z.union([
      z.lazy(() => ModuleItemUpdateWithoutChildrenInputObjectSchema),
      z.lazy(() => ModuleItemUncheckedUpdateWithoutChildrenInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => ModuleItemCreateWithoutChildrenInputObjectSchema),
      z.lazy(() => ModuleItemUncheckedCreateWithoutChildrenInputObjectSchema),
    ]),
  })
  .strict();

export const ModuleItemUpsertWithoutChildrenInputObjectSchema = Schema;
