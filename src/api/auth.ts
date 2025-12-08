import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./error.js";
import type { Request, Response } from "express";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash, makeJWT } from "../auth.js";
import { respondWithJSON } from "./json.js";
import { config } from "../config.js";


type UserResponse = Omit<NewUser, "hashedPassword"> & {
  token: string,
}

export async function handlerLogin(req: Request, res: Response): Promise<void> {
  type Parameters = {
    email: string;
    password: string;
    expiresInSeconds?: number
  };

  const params: Parameters = req.body;

  if (!params.expiresInSeconds || params.expiresInSeconds > config.jwt.defaultDuration) {
    params.expiresInSeconds = config.jwt.defaultDuration;
  }

  if (!params.email || !params.password) {
    throw new BadRequestError("email or password are missing");
  }

  const user = await getUserByEmail(params.email);

  if(!user) {
    throw new UnauthorizedError("Incorrect email or password");
  }

  const matching = await checkPasswordHash(params.password, user.hashedPassword);

  if(!matching) {
    throw new UnauthorizedError("Incorrect email or password");
  }

  const token = makeJWT(user.id, params.expiresInSeconds, config.jwt.secret);

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: token,
  } satisfies UserResponse)
}

