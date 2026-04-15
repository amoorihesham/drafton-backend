import { ITokenStroe } from "@/modules/auth/interfaces/token-store.interface";
import { Redis } from "@upstash/redis";

export class RefreshTokenStore implements ITokenStroe {
  constructor(private redis: Redis) {}

  private sessionKey(userId: string, deviceId: string) {
    return `session:${userId}:${deviceId}`;
  }

  async save(token: string, userId: string, deviceId: string, ttl: number) {
    const key = this.sessionKey(userId, deviceId);

    await this.redis.set(key, JSON.stringify({ token }), {
      ex: ttl,
    });
  }

  async verify(token: string, userId: string, deviceId: string) {
    const key = this.sessionKey(userId, deviceId);

    const data: { token: string } | null = await this.redis.get(key);

    if (!data) return false;

    if (data?.token !== token) return false;

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
