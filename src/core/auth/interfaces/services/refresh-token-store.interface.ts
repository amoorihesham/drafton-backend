export interface IRefreshTokenStore {
  save(token: string, userId: string, deviceId: string, ttl: number): Promise<void>;
  verify(token: string, userId: string, deviceId: string): Promise<boolean>;
  revoke(userId: string, deviceId: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
}
