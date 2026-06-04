import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { migrate } from "./db/migrate.js";

migrate();

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});
