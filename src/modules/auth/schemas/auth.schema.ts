import { successResponse } from "@/shared/http/response.utils";
import { Type } from "@sinclair/typebox";

export const registerSchema = {
  body: Type.Object({
    email: Type.String({ format: "email" }),
    username: Type.String({ minLength: 3, maxLength: 30 }),
    password: Type.String({ minLength: 8 }),
  }),
  response: {
    201: successResponse(
      Type.Object({
        id: Type.String(),
        email: Type.String(),
        username: Type.String(),
        role: Type.String(),
        isEmailVerified: Type.Boolean(),
        isActive: Type.Boolean(),
        createdAt: Type.String(),
      }),
    ),
  },
};

export const loginSchema = {
  body: Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8 }),
    deviceId: Type.String(),
  }),
  response: {
    200: successResponse(
      Type.Object({
        id: Type.String(),
        email: Type.String(),
        username: Type.String(),
        role: Type.String(),
        isEmailVerified: Type.Boolean(),
        isActive: Type.Boolean(),
        accessToken: Type.String(),
        createdAt: Type.String(),
      }),
    ),
  },
};

export const logoutSchema = {
  body: Type.Object({
    deviceId: Type.String(),
  }),
  
  response: {
    200: successResponse(Type.Object({})),
  },
};

export const refreshSchema = {
  cookies: Type.Object({
    refresh_token: Type.String(),
  }),
  body: Type.Object({
    deviceId: Type.String(),
  }),
  response: {
    200: successResponse(
      Type.Object({
        accessToken: Type.String(),
      }),
    ),
  },
};

export const getMeSchema = {
  response: {
    200: successResponse(
      Type.Object({
        user: Type.Object({
          id: Type.String(),
          email: Type.String(),
          username: Type.String(),
          role: Type.String(),
          isEmailVerified: Type.Boolean(),
          isActive: Type.Boolean(),
          createdAt: Type.String(),
          updatedAt: Type.String(),
        }),
        subscription: Type.Union([
          Type.Object({
            planName: Type.Union([Type.Literal("free"), Type.Literal("pro"), Type.Literal("ultimate")]),
            status: Type.String(),
            maxDocumentsPerDay: Type.Number(),
            features: Type.Unknown(),
            currentPeriodStart: Type.String(),
            currentPeriodEnd: Type.String(),
            trialEndsAt: Type.Union([Type.String(), Type.Null()]),
          }),
          Type.Null(),
        ]),
      }),
    ),
  },
};

export const verifyEmailSchema = {
  body: Type.Object({
    email: Type.String({ format: "email" }),
    otp: Type.String({ minLength: 6, maxLength: 6 }),
  }),
  response: {
    201: successResponse(
      Type.Object({
        id: Type.String(),
        email: Type.String(),
        username: Type.String(),
        role: Type.String(),
        isEmailVerified: Type.Boolean(),
        createdAt: Type.String(),
      }),
    ),
  },
};
