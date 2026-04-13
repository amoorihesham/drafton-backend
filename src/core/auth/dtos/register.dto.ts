// what the caller sends in
export interface RegisterDto {
  email: string;
  username: string;
  password: string;
}
export interface LoginDto {
  email: string;
  password: string;
  deviceId: string;
}

export interface RefreshDto {
  token: string;
  deviceId: string;
}

// what gets passed to the repository after hashing
export interface CreateUserDto {
  email: string;
  username: string;
  passwordHash: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}
