import * as authService from "../../src/services/auth-services";
import assert from "assert";

test("if hashing and comparing password functions work properly", async () => {
  const password = "MySecretpassword123<!";
  const SALT = 10;
  
  const hashedPwd = await authService.hashPassword(password, 10);
  assert.notEqual(password, hashedPwd);
  assert.ok(await authService.comparePassword(password, hashedPwd));
});