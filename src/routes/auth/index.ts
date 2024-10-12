import { Router } from "express";
import { validate } from "@middlewares/validation";
import { loginSchema, signUpSchema } from "@schema/auth-schema";
import { postLogin, postSignUp } from "@controllers/auth";
const router = Router();

router.post("/login", validate(loginSchema), postLogin);
router.post("/signup", validate(signUpSchema), postSignUp);

export default router;