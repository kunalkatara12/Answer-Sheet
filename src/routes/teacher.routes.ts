import { Router } from 'express';
import { login, logout, signup } from '../controllers/teacher.controllers';
import { loginValidator, registerValidator, validate } from '../utils/validators.utils';
import { upload } from '../middlewares/multer.middlewares';
import { uploadAnswerSheet } from '../controllers/answersheet.controllers';
import { verifyToken } from '../utils/token.utils';
const teacherRouter = Router();
teacherRouter.post("/signup", validate(registerValidator), signup);
teacherRouter.post("/login", validate(loginValidator), login);
teacherRouter.post("/logout", verifyToken, logout)
teacherRouter.post("/answerSheet", upload.single("answerSheet"), uploadAnswerSheet)

export default teacherRouter;