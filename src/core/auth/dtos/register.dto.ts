// what the caller sends in
export interface RegisterDto {
  email: string
  username: string
  password: string
  role: 'provider' | 'client'
}

// what gets passed to the repository after hashing
export interface CreateUserDto {
  email: string
  username: string
  passwordHash: string
  role: 'provider' | 'client'
}

export interface AuthTokensDto {
  accessToken: string
  refreshToken: string
}