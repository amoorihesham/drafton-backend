// what the caller sends in
export interface RegisterDto {
  email: string;
  username: string;
  password: string;
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
