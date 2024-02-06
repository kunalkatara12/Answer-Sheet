import { Router } from 'express';
import { signup } from '../controllers/teacher.controllers';
import { registerValidator, validate } from '../utils/validators.utils';
const teacherRouter = Router();
teacherRouter.post("/signup", validate(registerValidator), signup);
export default teacherRouter;