import supertest from "supertest";
import { server } from "../dist/index";
import test from "node:test";
import assert from "node:assert";

const api = supertest(server);

test("test if an unknown route returns 404 error code", async () => {
  const res = await api
    .get("/asdasdajdahsjd")
    .expect(404)
    .expect("Content-Type", /application\/json/);
  assert(!res.ok);
});
