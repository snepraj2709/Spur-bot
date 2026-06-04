import type { NextFunction, Request, Response } from "express";
import {
  getConversationHistory,
  sendChatMessage
} from "../services/chat.service.js";
import { HttpError } from "../middleware/error.middleware.js";
import { normalizeChatInput } from "../utils/validation.js";

export async function postChatMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = normalizeChatInput(req.body);
    const result = await sendChatMessage(input);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export function getChatSession(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = req.params.sessionId;

    if (!sessionId) {
      throw new HttpError(400, "sessionId is required.");
    }

    const result = getConversationHistory(sessionId);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
