jest.mock("../../src/utils/db");

import db from "../../src/utils/db";

describe("Test login service for users", () => {
  beforeEach(() => {});
  it("should fail", async () => {
    console.log(await db.user.findMany());
  });
});
