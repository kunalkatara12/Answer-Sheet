// Here you will write routes for your app

import { Router } from 'express';
import teacherRouter from './teacher.routes';
const appRouter = Router();
appRouter.use("/teacher",teacherRouter);

export default appRouter;