export interface LoginDto {
  email: string;
  password: string;
  deviceId: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}
