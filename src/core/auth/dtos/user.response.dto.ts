import { UserEntity } from "../entities/user.entity.js";

export interface UserResponseDto {
  id: string;
  email: string;
  username: string;
  role: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}

export function toUserResponseDto(user: UserEntity): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
