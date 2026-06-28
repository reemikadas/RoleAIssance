import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { ProfileRepository } from "./database.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataDirectory = resolve(here, "../.data");
mkdirSync(dataDirectory, { recursive: true });

const repository = new ProfileRepository(resolve(dataDirectory, "roleaissance.db"));
const port = Number(process.env.PORT ?? 8787);
const server = createApp(repository).listen(port, "127.0.0.1", () => {
  console.log(`RoleAIssance API listening on http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => {
    repository.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
