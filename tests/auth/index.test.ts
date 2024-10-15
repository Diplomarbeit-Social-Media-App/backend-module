import service from "../../src/services/index";
import assert from "assert";

test("if hashing and comparing password functions work properly", async () => {
  const password = "MySecretpassword123<!";
  const SALT = 10;
  
  const hashedPwd = await service.auth.hashPassword(password, 10);
  assert.notEqual(password, hashedPwd);
  assert.ok(await service.auth.comparePassword(password, hashedPwd));
});