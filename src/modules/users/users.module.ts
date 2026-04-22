import { Database } from "@/db/connection.js";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";
import { UsersRepository } from "@/db/repositories/users.repository.js";

export const buildUsersModule = (db: Database) => {
  const userRepository = new UsersRepository(db);
  const usersService = new UsersService(userRepository);
  const usersController = new UsersController(usersService);

  return usersController;
};
