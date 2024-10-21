import { Router } from "express";
import { validate } from "../../middlewares/validation";
import { loginSchema, signUpSchema } from "../../schema/auth-schema";
import controllers from "../../controllers/index";
const router = Router();

router.post("/login", validate(loginSchema), controllers.auth.postLogin);
router.post("/signup", validate(signUpSchema), controllers.auth.postSignUp);

export default router;
