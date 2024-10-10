import { Router } from "express";
import { validate } from "../../middlewares/validation";
import { loginSchema } from "../../schema/auth-schema";
import { postLogin } from "../../controllers/auth";
const router = Router();

router.post("/login", validate(loginSchema), postLogin);

export default router;