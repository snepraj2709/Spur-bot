import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { chatRouter } from "./routes/chat.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json({ limit: "64kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/chat", chatRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
