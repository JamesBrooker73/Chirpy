import type { Request, Response } from "express";
import { createUser, updateUser, validateUser } from "../db/queries/users.js"
import { BadRequestError, UnauthorizedError } from "./error.js";
import { respondWithJSON } from "./json.js";
import { NewUser } from "../db/schema.js";
import { getBearerToken, hashPassword, makeJWT, validateJWT } from "../auth.js";
import { config } from "../config.js";

type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response): Promise<void> {
  type Parameters = {
    email: string;
    password: string;
  };

  const params: Parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Invalid parameters");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({ email: params.email, hashedPassword: hashedPassword } satisfies NewUser);

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);

}

export async function handlerUpdateUser(req: Request, res: Response): Promise<void> {
    type Parameters = {
        email: string,
        password: string,
      };

    const token = getBearerToken(req);
    const tokenedUser = validateJWT(token, config.jwt.secret);
    
    const user = await validateUser(tokenedUser);
  
    if(!user) {
      throw new UnauthorizedError("user not verified");
    }
    
    const params: Parameters = req.body;

    if (!params.email || !params.password) {
      throw new BadRequestError("email and password are required");
    }
  
    const hashedPassword = await hashPassword(params.password);

    const updatedUser = await updateUser(user.id, params.email, hashedPassword);

    if (!updatedUser) {
      throw new Error("Could not update user");
    }

    respondWithJSON(res, 200, {
      id: updatedUser.id,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    } satisfies UserResponse);

    
}