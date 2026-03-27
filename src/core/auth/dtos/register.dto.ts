export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  passwordHash: string;
  role: "provider" | "client";
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}
