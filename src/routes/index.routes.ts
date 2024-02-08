// Here you will write routes for your app

import { Router } from 'express';
import teacherRouter from './teacher.routes';
import studentRouter from './student.routes';
const appRouter = Router();
appRouter.use("/teacher",teacherRouter);
appRouter.use("/student",studentRouter)

export default appRouter;