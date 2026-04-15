import { QueryResult } from "pg";
import { CreateUserDto, FullUserType } from "../types";

export interface IAuthRepository {
  // user operations
  findUserByEmail(email: string): Promise<FullUserType | undefined>;
  findUserById(id: string): Promise<FullUserType | undefined>;
  findUserByUsername(username: string): Promise<FullUserType | undefined>;

  createUser(dto: CreateUserDto): Promise<FullUserType[]>;
  updateUser(
    userId: string,
    dto: Partial<FullUserType>,
  ): Promise<FullUserType[]>;
  deleteUser(userId: string): Promise<QueryResult<never>>;

  // verification
  saveEmailVerificationOtp(
    userId: string,
    otp: string,
    expiry: Date,
  ): Promise<QueryResult<never>>;
  clearEmailVerificationOtp(userId: string): Promise<QueryResult<never>>;
}
