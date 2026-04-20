import { writeFileSync } from "fs";
import { buildApp } from "../app.js";

async function generate() {
  const app = await buildApp();
  await app.ready();

  const spec = JSON.stringify(app.swagger(), null, 2);
  writeFileSync("docs/openapi.json", spec);

  console.log("OpenAPI spec written to docs/openapi.json");
  await app.close();
}

generate().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
