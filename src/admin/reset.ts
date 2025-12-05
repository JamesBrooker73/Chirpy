import type { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "../api/error.js";
import { deleteUsers } from "../db/queries/users.js";
import { respondWithJSON } from "../api/json.js";

export async function handlerResetFileServerHits(_: Request, res: Response): Promise<void> {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError("Forbidden access");
  }
  config.api.fileServerHits = 0;
  await deleteUsers();
  res.write("Hits reset to 0 and users deleted");
  res.end();
}