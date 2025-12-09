import argon2 from "argon2";
import type { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./api/error.js";
import { config } from "./config.js";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  const hash = await argon2.hash(password);
  return hash;
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  if (!password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: config.jwt.issuer,
      sub: userID,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );

  return token;
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: payload;
    try {
      decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token has expired");
    }
    throw new UnauthorizedError("Invalid token");
  }

    if (decoded.iss !== config.jwt.issuer) {
      throw new UnauthorizedError("Invalid issuer");
    }

    if (!decoded.sub) {
      throw new UnauthorizedError("No user ID in token");
    }

  return decoded.sub;
}

export function getBearerToken(req: Request) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UnauthorizedError("Malformed authorization header");
  }

  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new UnauthorizedError("Malformed authorization header");
  }
  return splitAuth[1];
}

export function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}