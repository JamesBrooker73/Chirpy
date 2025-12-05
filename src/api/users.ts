import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js"
import { BadRequestError } from "./error.js";
import { respondWithJSON } from "./json.js";

export async function handlerCreateUser(req: Request, res: Response): Promise<void> {
  type parameters = {
    email: string;
  };

  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("An email address wasn't provided");
  }

  const user = await createUser({ email: params.email });

  if (!user) {
    throw new Error("Could not create user");
  }
  
  respondWithJSON(res, 201, user);

}