export interface RegisterDto {
  email: string;
  password: string;
  role: "provider" | "client";
}
