import { buildApp } from "./app.js";

async function bootstrap() {
  const app = await buildApp();

  await app.listen(
    {
      port: app.config.PORT,
      host: "127.0.0.1",
    },
    (err) => {
      console.log(`SERVER RUNNING AT ${app.config.PORT}`);
    },
  );
}

bootstrap();
