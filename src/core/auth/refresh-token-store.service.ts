import crypto from "node:crypto";
import { Redis } from "@upstash/redis";

export class RefreshTokenStore {
  constructor(private redis: Redis) {}

  private hash(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async save(token: string, userId: string, ttl: number) {
    const hash = this.hash(token);
    const key = `refresh:${hash}`;
    const userKey = `user_sessions:${userId}`;

    const pipeline = this.redis.multi();

    pipeline.set(key, userId, { ex: ttl });
    pipeline.sadd(userKey, hash);
    pipeline.expire(userKey, ttl);

    await pipeline.exec();
  }

  async verify(token: string) {
    const hash = this.hash(token);
    return this.redis.get(`refresh:${hash}`);
  }

  async revoke(token: string) {
    const hash = this.hash(token);
    const key = `refresh:${hash}`;

    const userId = await this.redis.get(key);
    if (!userId) return;

    const pipeline = this.redis.multi();
    pipeline.del(key);
    pipeline.srem(`user_sessions:${userId}`, hash);

    await pipeline.exec();
  }

  async revokeAll(userId: string) {
    const userKey = `user_sessions:${userId}`;
    const tokens = await this.redis.smembers(userKey);

    const pipeline = this.redis.multi();

    for (const hash of tokens) {
      pipeline.del(`refresh:${hash}`);
    }

    pipeline.del(userKey);

    await pipeline.exec();
  }
}
