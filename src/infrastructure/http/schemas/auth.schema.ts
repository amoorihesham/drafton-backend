import { Type } from "@sinclair/typebox";

const successResponse = (dataSchema: ReturnType<typeof Type.Object>) =>
  Type.Object({
    success: Type.Boolean(),
    message: Type.String(),
    data: dataSchema,
  });

export const registerSchema = {
  body: Type.Object({
    email: Type.String({ format: "email" }),
    username: Type.String({ minLength: 3, maxLength: 30 }),
    password: Type.String({ minLength: 8 }),
    deviceId: Type.String(),
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
        createdAt: Type.String(),
        accessToken: Type.String(),
      }),
    ),
  },
};

export const logoutSchema = {
  cookies: Type.Object({
    refresh_token: Type.String(),
  }),
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
