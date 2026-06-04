import { Router } from "express";
import {
  getChatSession,
  postChatMessage
} from "../controllers/chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/message", postChatMessage);
chatRouter.get("/session/:sessionId", getChatSession);
