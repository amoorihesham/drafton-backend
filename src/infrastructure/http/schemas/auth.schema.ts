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
  }),
  response: {
    201: successResponse(
      Type.Object({
        message: Type.String(),
      }),
    ),
  },
};
