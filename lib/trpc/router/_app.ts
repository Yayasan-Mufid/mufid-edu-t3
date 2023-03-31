import { router } from "../trpc";
import examRouter from "./exam";
import programRouter from "./program";
import moduleRouter from "./module";
import moduleItemRouter from "./module-item";
import studyGroupRouter from "./study-group";
import userRouter from "./user";

export const appRouter = router({
  exam: examRouter,
  program: programRouter,
  module: moduleRouter,
  moduleItem: moduleItemRouter,
  studyGroup: studyGroupRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter