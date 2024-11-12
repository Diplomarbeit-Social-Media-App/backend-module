import db from "../../src/utils/db";
import { loginSchema } from "../../src/types/auth";
import { loginSchema as loginValidation } from "../../src/schema/auth";
import { shouldFail, shouldPass } from "../../src/utils/testUtils";

interface IBodyLoginSchema {
  body: loginSchema;
}

const dummyLoginData: loginSchema = {
  userName: "TestDummy1",
  password: "Passwort123!",
};

const buildDummyLogin = (val?: Partial<loginSchema>): IBodyLoginSchema => {
  return { body: { ...dummyLoginData, ...val } };
};

describe("Test check validation", () => {
  it("should fail without a username", async () => {
    const test = buildDummyLogin({ userName: undefined });
    shouldFail(loginValidation, test);
  });

  it("should fail without a password", async () => {
    const test = buildDummyLogin({ password: undefined });
    shouldFail(loginValidation, test);
  });

  it("should pass with dummy login data", async () => {
    const test = buildDummyLogin();
    shouldPass(loginValidation, test);
  });
});
