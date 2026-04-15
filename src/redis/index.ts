import { Redis } from "@upstash/redis";

export function createRedisConnection() {
  return Redis.fromEnv();
}
