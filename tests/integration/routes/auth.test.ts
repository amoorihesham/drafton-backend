import { FastifyInstance } from "fastify";
import { describe, it, beforeAll, afterAll, expect, afterEach } from "vitest";
import { buildApp } from "@/app";
import { AUTH_ERROR_CODES, AUTH_MESSAGES } from "@/core/auth/constants/messages";
import { getDatabase } from "@/infrastructure/db/connection";
import { users } from "@/infrastructure/db/schema";

describe("Register Route", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });
  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    const db = await getDatabase();
    await db.delete(users);
  });

  it("Should return 201 and create a new user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "test@gmail.org",
        username: "amrhesham",
        password: "StrongPass123!",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(await response.json()).toEqual({
      success: true,
      message: "Registration successful. Please check your email for the verification OTP.",
      data: {
        id: expect.any(String),
        email: "test@gmail.org",
        username: "amrhesham",
        role: "client",
        isEmailVerified: false,
        createdAt: expect.any(String),
      },
    });
  });

  it("Should return 409 if user already exists", async () => {
    const payload = {
      email: "testConflict@gmail.org",
      username: "amrheshamConflict",
      password: "StrongPass123!",
    };

    const seedResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload,
    });

    expect(seedResponse.statusCode).toBe(201);

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload,
    });

    expect(response.statusCode).toBe(409);
    expect(await response.json()).toEqual({
      success: false,
      error: {
        code: AUTH_ERROR_CODES.EMAIL_TAKEN,
        message: AUTH_MESSAGES.EMAIL_TAKEN,
      },
    });
  });

  it("Should return 400 if password is weak", async () => {
    const payload = {
      email: "testWeakPassword@gmail.org",
      username: "amrheshamWeakPassword",
      password: "123",
    };

    const seedResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload,
    });

    expect(seedResponse.statusCode).toBe(400);
    expect(await seedResponse.json()).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: expect.any(String),
      },
    });
  });
});
