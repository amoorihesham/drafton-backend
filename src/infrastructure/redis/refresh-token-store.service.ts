import crypto from "node:crypto";
import { Redis } from "@upstash/redis";
import { IRefreshTokenStore } from "@/core/auth/interfaces/services/refresh-token-store.interface";

export class RefreshTokenStore implements IRefreshTokenStore {
  constructor(private redis: Redis) {}

  private hash(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private sessionKey(userId: string, deviceId: string) {
    return `session:${userId}:${deviceId}`;
  }

  async save(token: string, userId: string, deviceId: string, ttl: number) {
    const hash = this.hash(token);
    const key = this.sessionKey(userId, deviceId);

    await this.redis.set(key, JSON.stringify({ refreshHash: hash }), {
      ex: ttl,
    });
  }

  async verify(token: string, userId: string, deviceId: string) {
    const hash = this.hash(token);
    const key = this.sessionKey(userId, deviceId);

    const data: { refreshHash: string } | null = await this.redis.get(key);

    if (!data) return false;

    if (data?.refreshHash !== hash) return false;

    return true;
  }

  async revoke(userId: string, deviceId: string) {
    const key = this.sessionKey(userId, deviceId);
    await this.redis.del(key);
  }

  async revokeAll(userId: string) {
    const pattern = `session:${userId}:*`;

    const keys = await this.redis.keys(pattern);

    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}
