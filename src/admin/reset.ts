import type { Request, Response } from "express";
import { apiConfig } from "../config.js";

export async function handlerResetFileServerHits(_: Request, res: Response): Promise<void> {
  apiConfig.fileServerHits = 0;
  res.status(200).send("Hits reset to 0");
}