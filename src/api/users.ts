import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js"
import { BadRequestError } from "./error.js";
import { respondWithJSON } from "./json.js";
import { NewUser } from "../db/schema.js";
import { hashPassword, makeJWT } from "../auth.js";

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