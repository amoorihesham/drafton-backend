import { QueryResult } from "pg";
import { CreateUserDto } from "../types";
import { User } from "@/types/shared/user";

export interface IAuthRepository {
  // user operations
  findUserByEmail(email: string): Promise<User | undefined>;
  findUserById(id: string): Promise<User | undefined>;
  findUserByUsername(username: string): Promise<User | undefined>;

  createUser(dto: CreateUserDto): Promise<User[]>;
  updateUser(userId: string, dto: Partial<User>): Promise<User[]>;
  deleteUser(userId: string): Promise<QueryResult<never>>;

  // verification
  saveEmailVerificationOtp(userId: string, otp: string, expiry: Date): Promise<QueryResult<never>>;
  clearEmailVerificationOtp(userId: string): Promise<QueryResult<never>>;
}
