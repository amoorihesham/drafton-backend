import { Config } from "../config/index.js";
import { JwtPayload } from "../modules/auth/types/index.js";

declare module "fastify" {
  interface FastifyInstance {
    config: Config;
  }

  interface FastifyRequest {
    user: JwtPayload;
  }
}
