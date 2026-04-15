import bcrypt from "bcrypt";

export async function hash(
  password: string,
  saltRounds?: number,
): Promise<string> {
  return bcrypt.hash(password, saltRounds || 10);
}

export async function compare(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
