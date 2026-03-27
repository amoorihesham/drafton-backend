import { FastifyInstance } from "fastify";
import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { buildApp } from "../../../src/app";

describe("Hello Route", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  it("Should return 200", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/hello",
    });
    expect(response.statusCode).toBe(200);
  });

  it("Should Return A Message", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/hello",
    });
    expect(response.json()).toEqual({ message: "Hello From Drafton Backend" });
  });
});
