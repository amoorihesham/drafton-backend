export type HashingManagerConfig = {
  saltRounds: number;
};

export interface IPasswordManager {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
