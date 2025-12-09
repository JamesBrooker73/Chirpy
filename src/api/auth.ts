import { getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./error.js";
import type { Request, Response } from "express";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth.js";
import { respondWithJSON } from "./json.js";
import { config } from "../config.js";
import { checkUserRefreshToken, revokeRefreshToken, writeRefreshToken } from "../db/queries/refresh_tokens.js";


type UserResponse = Omit<NewUser, "hashedPassword"> & {
  token: string,
  refreshToken: string,
}

export async function handlerLogin(req: Request, res: Response): Promise<void> {
  type Parameters = {
    email: string;
    password: string;
  };

  const params: Parameters = req.body;
  
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

  const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);
  const refreshToken = makeRefreshToken();

  const saved = await writeRefreshToken(refreshToken, user.id);
  if (!saved) {
    throw new UnauthorizedError("could not save refresh token");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: accessToken,
    refreshToken: refreshToken,
  } satisfies UserResponse)
}

export async function handlerCheckRefreshToken(req: Request, res: Response): Promise<void> {
  const refreshToken = getBearerToken(req);
  const result = await checkUserRefreshToken(refreshToken);

  if (!result) {
    throw new UnauthorizedError("The refresh token is not valid");
  }

  const user = result.user;

  const accessToken = makeJWT(user.id, config.jwt.defaultDuration, config.jwt.secret);

  respondWithJSON(res, 200, { token: accessToken});

}

export async function handlerCheckRevokeToken(req: Request, res: Response): Promise<void> {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);
  res.status(204).send();

}

